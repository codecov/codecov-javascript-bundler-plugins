import { ReadableStream, TextEncoderStream } from "node:stream/web";

import { FailedUploadError } from "../errors/FailedUploadError";
import { green, red } from "./logging";
import { fetchWithRetry } from "./fetchWithRetry";
import { DEFAULT_RETRY_COUNT } from "./constants";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError";
import { FailedFetchError } from "../errors/FailedFetchError";

interface UploadStatsArgs {
  message: string;
  preSignedUrl: string;
  retryCount?: number;
}

export async function uploadStats({
  message,
  preSignedUrl,
  retryCount = DEFAULT_RETRY_COUNT,
}: UploadStatsArgs) {
  const iterator = message[Symbol.iterator]();
  const stream = new ReadableStream({
    pull(controller) {
      const iteration = iterator.next();

      if (iteration.done) {
        controller.close();
      } else {
        controller.enqueue(iteration.value);
      }
    },
  }).pipeThrough(new TextEncoderStream());

  let response: Response;
  try {
    response = await fetchWithRetry({
      url: preSignedUrl,
      retryCount,
      name: "`upload-stats`",
      requestData: {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        duplex: "half",
        // @ts-expect-error TypeScript doesn't know that fetch can accept a
        // ReadableStream as the body
        body: stream,
      },
    });
  } catch (e) {
    red("Failed to upload stats, fetch failed");
    throw new FailedFetchError("Failed to upload stats");
  }

  if (response.status === 429) {
    red("Upload limit reached");
    throw new UploadLimitReachedError("Upload limit reached");
  }

  if (!response.ok) {
    red("Failed to upload stats, bad response");
    throw new FailedUploadError("Failed to upload stats");
  }

  green("Successfully uploaded stats");
  return true;
}
