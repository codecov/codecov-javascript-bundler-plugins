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

interface GetPreSignedURLArgs {
  apiURL: string;
  uploadToken?: string;
  serviceParams: Partial<ProviderServiceParams>;
  retryCount?: number;
  gitService?: string;
}

type RequestBody = Record<string, string | null | undefined>;

const PreSignedURLSchema = z.object({
  url: z.string(),
});

export const getPreSignedURL = async ({
  apiURL,
  uploadToken,
  serviceParams,
  retryCount = DEFAULT_RETRY_COUNT,
  gitService,
}: GetPreSignedURLArgs) => {
  const url = `${apiURL}/upload/bundle_analysis/v1`;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const requestBody: RequestBody = serviceParams;
  /**
   * We currently require the branch to be in the format `owner:branch` to identify that it is a
   * proper tokenless upload.
   * See: https://github.com/codecov/codecov-api/pull/741
   */
  if (!uploadToken && serviceParams.branch?.includes(":")) {
    if (gitService && gitService !== "") {
      requestBody.git_service = gitService;
    } else {
      const foundGitService = findGitService();
      if (!foundGitService || foundGitService === "") {
        red("Failed to find git service for tokenless upload");
        throw new UndefinedGitServiceError("No upload token provided");
      }

      requestBody.git_service = foundGitService;
    }
  } else if (uploadToken) {
    headers.set("Authorization", `token ${uploadToken}`);
  } else {
    red("No upload token provided");
    throw new NoUploadTokenError("No upload token provided");
  }

  let response: Response;
  try {
    response = await fetchWithRetry({
      url,
      retryCount,
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
