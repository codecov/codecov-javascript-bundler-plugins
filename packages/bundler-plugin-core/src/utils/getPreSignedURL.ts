import { z } from "zod";

import { FailedFetchError } from "../errors/FailedFetchError.ts";
import { NoUploadTokenError } from "../errors/NoUploadTokenError.ts";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError.ts";
import { type ProviderServiceParams } from "../types.ts";
import { DEFAULT_RETRY_COUNT } from "./constants.ts";
import { fetchWithRetry } from "./fetchWithRetry.ts";
import { green, red, yellow } from "./logging.ts";
import { preProcessBody } from "./preProcessBody.ts";

interface GetPreSignedURLArgs {
  apiURL: string;
  globalUploadToken?: string;
  repoToken?: string;
  serviceParams: Partial<ProviderServiceParams>;
  retryCount?: number;
}

const PreSignedURLSchema = z.object({
  url: z.string(),
});

export const getPreSignedURL = async ({
  apiURL,
  globalUploadToken,
  repoToken,
  serviceParams,
  retryCount = DEFAULT_RETRY_COUNT,
}: GetPreSignedURLArgs) => {
  const token = getToken(globalUploadToken, repoToken);
  if (!token) {
    red("No upload token found");
    throw new NoUploadTokenError("No upload token found");
  }

  const commitSha = serviceParams?.commit ?? "";
  const url = `${apiURL}/upload/service/commits/${commitSha}/bundle_analysis`;

  const sentServiceParams = preProcessBody({ token, ...serviceParams });

  let response: Response;
  try {
    response = await fetchWithRetry({
      url,
      retryCount,
      name: "`get-pre-signed-url`",
      requestData: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify(sentServiceParams),
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

const getToken = (
  globalUploadToken: string | undefined,
  repoToken: string | undefined,
) => {
  if (globalUploadToken && repoToken) {
    yellow(
      "Both globalUploadToken and repoToken found, Using globalUploadToken",
    );
  }

  if (globalUploadToken) {
    return globalUploadToken;
  }

  if (repoToken) {
    return repoToken;
  }

  return undefined;
};
