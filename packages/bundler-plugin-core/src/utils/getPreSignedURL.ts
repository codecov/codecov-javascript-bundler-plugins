import { z } from "zod";

import { FailedFetchError } from "../errors/FailedFetchError.ts";
import { NoUploadTokenError } from "../errors/NoUploadTokenError.ts";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError.ts";
import { type ProviderServiceParams } from "../types.ts";
import { DEFAULT_RETRY_COUNT } from "./constants.ts";
import { type Gauge, fetchWithRetry } from "./fetchWithRetry.ts";
import { green, red } from "./logging.ts";
import { preProcessBody } from "./preProcessBody.ts";

interface GetPreSignedURLArgs {
  apiURL: string;
  uploadToken?: string;
  serviceParams: Partial<ProviderServiceParams>;
  retryCount?: number;
  gauge?: Gauge;
}

const PreSignedURLSchema = z.object({
  url: z.string(),
});

export const getPreSignedURL = async ({
  apiURL,
  uploadToken,
  serviceParams,
  retryCount = DEFAULT_RETRY_COUNT,
  gauge,
}: GetPreSignedURLArgs) => {
  if (!uploadToken) {
    red("No upload token found");
    throw new NoUploadTokenError("No upload token found");
  }

  const url = `${apiURL}/upload/bundle_analysis/v1`;

  let response: Response;
  try {
    response = await fetchWithRetry({
      url,
      retryCount,
      gauge,
      name: "get-pre-signed-url",
      requestData: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${uploadToken}`,
        },
        body: JSON.stringify(preProcessBody(serviceParams)),
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
