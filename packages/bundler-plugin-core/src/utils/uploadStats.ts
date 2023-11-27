import { FailedUploadError } from "@/errors/FailedUploadError";
import { ReadableStream, TextEncoderStream } from "node:stream/web";
import { red } from "./logging";
import { fetchWithRetry } from "./fetchWithRetry";
import { DEFAULT_RETRY_COUNT } from "./constants";

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

  try {
    const response = await fetchWithRetry(
      preSignedUrl,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        duplex: "half",
        // @ts-expect-error TypeScript doesn't know that fetch can accept a
        // ReadableStream as the body
        body: stream,
      },
      retryCount,
    );

    return response;
  } catch (e) {
    red("Failed to upload stats");
    throw new FailedUploadError("Failed to upload stats");
  }
}
