import * as Core from "@actions/core";
import { z } from "zod";
import { FailedFetchError } from "../errors/FailedFetchError.ts";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError.ts";
import { type ProviderServiceParams } from "../types.ts";
import { DEFAULT_RETRY_COUNT } from "./constants.ts";
import { fetchWithRetry } from "./fetchWithRetry.ts";
import { green, red } from "./logging.ts";
import { preProcessBody } from "./preProcessBody.ts";
import { NoUploadTokenError } from "../errors/NoUploadTokenError.ts";
import { findGitService } from "./findGitService.ts";
import { UndefinedGitServiceError } from "../errors/UndefinedGitServiceError.ts";
import { FailedOIDCFetch } from "../errors/FailedOIDCFetch.ts";
import { type Output } from "./Output.ts";
import { BadOIDCServiceError } from "../errors/BadOIDCServiceError.ts";

interface GetPreSignedURLArgs {
  serviceParams: Partial<ProviderServiceParams>;
  output: Output;
}

type RequestBody = Record<string, string | null | undefined>;

const PreSignedURLSchema = z.object({
  url: z.string(),
});

const API_ENDPOINT = "/upload/bundle_analysis/v1";

export const getPreSignedURL = async ({
  serviceParams,
  output,
}: GetPreSignedURLArgs) => {
  let url = output.apiUrl;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const requestBody: RequestBody = serviceParams;
  /**
   * We currently require the branch to be in the format `owner:branch` to identify that it is a
   * proper tokenless upload.
   * See: https://github.com/codecov/codecov-api/pull/741
   */
  if (!output.uploadToken && serviceParams.branch?.includes(":")) {
    if (output.gitService) {
      requestBody.git_service = output.gitService;
    } else {
      const foundGitService = findGitService();
      if (!foundGitService || foundGitService === "") {
        red("Failed to find git service for tokenless upload");
        throw new UndefinedGitServiceError("No upload token provided");
      }

      requestBody.git_service = foundGitService;
    }
  } else if (output.oidc?.useGitHubOIDC && Core) {
    if (serviceParams?.service !== "github-actions") {
      red("OIDC is only supported for GitHub Actions");
      throw new BadOIDCServiceError(
        "OIDC is only supported for GitHub Actions",
      );
    }

    let token = "";
    try {
      token = await Core.getIDToken(output.oidc.gitHubOIDCTokenAudience);
    } catch (err) {
      if (err instanceof Error) {
        red(
          `Failed to get OIDC token with url:\`${output.oidc.gitHubOIDCTokenAudience}\`. ${err.message}`,
        );
        throw new FailedOIDCFetch(
          `Failed to get OIDC token with url: \`${output.oidc.gitHubOIDCTokenAudience}\`. ${err.message}`,
        );
      }
    }

    headers.set("Authorization", `token ${token}`);
  } else if (output.uploadToken) {
    headers.set("Authorization", `token ${output.uploadToken}`);
  } else {
    red("No upload token provided");
    throw new NoUploadTokenError("No upload token provided");
  }

  let response: Response;
  try {
    response = await fetchWithRetry({
      url: `${url}${API_ENDPOINT}`,
      retryCount: output.retryCount ?? DEFAULT_RETRY_COUNT,
      name: "`get-pre-signed-url`",
      requestData: {
        method: "POST",
        headers: headers,
        body: JSON.stringify(preProcessBody(requestBody)),
      },
    });
  } catch (e) {
    red("Failed to fetch pre-signed URL");
    throw new FailedFetchError("Failed to fetch pre-signed URL");
  }

  if (response.status === 429) {
    red("Upload limit reached");
    throw new UploadLimitReachedError("Upload limit reached");
  }

  if (!response.ok) {
    red("Failed to get pre-signed URL, bad response");
    throw new FailedFetchError("Failed to get pre-signed URL");
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    red("Failed to parse pre-signed URL body");
    throw new FailedFetchError("Failed to parse pre-signed URL body");
  }

  const parsedData = PreSignedURLSchema.safeParse(data);

  if (!parsedData.success) {
    red("Failed to validate pre-signed URL");
    throw new FailedFetchError("Failed to validate pre-signed URL");
  }

  green(`Successfully pre-signed URL fetched`);
  return parsedData.data.url;
};
