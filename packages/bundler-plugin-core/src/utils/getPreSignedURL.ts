import * as Core from "@actions/core";
import { z } from "zod";
import { FailedFetchError } from "../errors/FailedFetchError.ts";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError.ts";
import { type ProviderServiceParams } from "../types.ts";
import { fetchWithRetry } from "./fetchWithRetry.ts";
import { green, red } from "./logging.ts";
import { preProcessBody } from "./preProcessBody.ts";
import { NoUploadTokenError } from "../errors/NoUploadTokenError.ts";
import { findGitService } from "./findGitService.ts";
import { UndefinedGitServiceError } from "../errors/UndefinedGitServiceError.ts";
import { FailedOIDCFetchError } from "../errors/FailedOIDCFetchError.ts";
import { BadOIDCServiceError } from "../errors/BadOIDCServiceError.ts";

interface GetPreSignedURLArgs {
  apiUrl: string;
  uploadToken?: string;
  serviceParams: Partial<ProviderServiceParams>;
  retryCount?: number;
  gitService?: string;
  oidc?: {
    useGitHubOIDC: boolean;
    gitHubOIDCTokenAudience: string;
  };
}

type RequestBody = Record<string, string | null | undefined>;

const PreSignedURLSchema = z.object({
  url: z.string(),
});

const API_ENDPOINT = "/upload/bundle_analysis/v1";

export const getPreSignedURL = async ({
  apiUrl,
  uploadToken,
  serviceParams,
  retryCount,
  gitService,
  oidc,
}: GetPreSignedURLArgs) => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const requestBody: RequestBody = serviceParams;
  /**
   * We require the branch to be in the format `owner:branch` for tokenless v2 upload.
   * True Tokenless is allowed with any branch format.
   */
  if (!uploadToken) {
    if (gitService) {
      requestBody.git_service = gitService;
    } else {
      const foundGitService = findGitService();
      if (!foundGitService || foundGitService === "") {
        red("Failed to find git service for tokenless upload");
        throw new UndefinedGitServiceError("No upload token provided");
      }

      requestBody.git_service = foundGitService;
    }
  } else if (oidc?.useGitHubOIDC && Core) {
    if (serviceParams?.service !== "github-actions") {
      red("OIDC is only supported for GitHub Actions");
      throw new BadOIDCServiceError(
        "OIDC is only supported for GitHub Actions",
      );
    }

    let token = "";
    try {
      token = await Core.getIDToken(oidc.gitHubOIDCTokenAudience);
    } catch (err: unknown) {
      if (err instanceof Error) {
        red(
          `Failed to get OIDC token with url:\`${oidc.gitHubOIDCTokenAudience}\`. ${err.message}`,
        );
        throw new FailedOIDCFetchError(
          `Failed to get OIDC token with url: \`${oidc.gitHubOIDCTokenAudience}\`. ${err.message}`,
          { cause: err },
        );
      }
    }

    headers.set("Authorization", `token ${token}`);
  } else if (uploadToken) {
    headers.set("Authorization", `token ${uploadToken}`);
  } else {
    red("No upload token provided");
    throw new NoUploadTokenError("No upload token provided");
  }

  let response: Response;
  try {
    const body = preProcessBody(requestBody);
    response = await fetchWithRetry({
      retryCount,
      url: `${apiUrl}${API_ENDPOINT}`,
      name: "`get-pre-signed-url`",
      requestData: {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      },
    });
  } catch (e) {
    red("Failed to fetch pre-signed URL");
    throw new FailedFetchError("Failed to fetch pre-signed URL", { cause: e });
  }

  if (response.status === 429) {
    red("Upload limit reached");
    throw new UploadLimitReachedError("Upload limit reached");
  }

  if (!response.ok) {
    red(
      `Failed to get pre-signed URL, bad response: "${response.status} - ${response.statusText}"`,
    );
    throw new FailedFetchError("Failed to get pre-signed URL");
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    red("Failed to parse pre-signed URL body");
    throw new FailedFetchError("Failed to parse pre-signed URL body", {
      cause: e,
    });
  }

  const parsedData = PreSignedURLSchema.safeParse(data);

  if (!parsedData.success) {
    red("Failed to validate pre-signed URL");
    throw new FailedFetchError("Failed to validate pre-signed URL");
  }

  green(`Successfully pre-signed URL fetched`);
  return parsedData.data.url;
};
