import { FailedUploadError } from "@/errors/FailedUploadError";
import { ReadableStream, TextEncoderStream } from "node:stream/web";
import { red } from "./logging";

interface UploadStatsArgs {
  message: string;
  preSignedUrl: string;
}

export async function uploadStats({ message, preSignedUrl }: UploadStatsArgs) {
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
    const response = await fetch(preSignedUrl, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      duplex: "half",
      // @ts-expect-error TypeScript doesn't know that fetch can accept a
      // ReadableStream as the body
      body: stream,
    });

    return response;
  } catch (e) {
    red("Failed to upload stats");
    throw new FailedUploadError("Failed to upload stats");
  }
}
