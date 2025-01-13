import { ReadableStream, TextEncoderStream } from "node:stream/web";
import { startSpan, type Scope, type Span } from "@sentry/core";

import { FailedUploadError } from "../errors/FailedUploadError";
import { green, red } from "./logging";
import { fetchWithRetry } from "./fetchWithRetry";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError";
import { FailedFetchError } from "../errors/FailedFetchError";

interface UploadStatsArgs {
  message: string;
  bundleName: string;
  preSignedUrl: string;
  retryCount?: number;
  sentryScope?: Scope;
  sentrySpan?: Span;
}

export async function uploadStats({
  message,
  bundleName,
  preSignedUrl,
  retryCount,
  sentryScope,
  sentrySpan,
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
    response = await startSpan(
      {
        name: "Uploading Stats",
        op: "http.client",
        scope: sentryScope,
        parentSpan: sentrySpan,
      },
      async (uploadStatsSpan) => {
        let wrappedResponse: Response;
        const HTTP_METHOD = "PUT";

        if (uploadStatsSpan) {
          // we're not collecting the URL here because its a pre-signed URL
          uploadStatsSpan.setAttribute("http.request.method", HTTP_METHOD);
        }

        try {
          wrappedResponse = await fetchWithRetry({
            url: preSignedUrl,
            retryCount,
            name: "`upload-stats`",
            requestData: {
              method: HTTP_METHOD,
              headers: {
                "Content-Type": "application/json",
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

        if (uploadStatsSpan) {
          // Set attributes for the response
          uploadStatsSpan.setAttribute(
            "http.response.status_code",
            wrappedResponse.status,
          );
          uploadStatsSpan.setAttribute(
            "http.response_content_length",
            Number(wrappedResponse.headers.get("content-length")),
          );
          uploadStatsSpan.setAttribute(
            "http.response.status_text",
            wrappedResponse.statusText,
          );
        }

        return wrappedResponse;
      },
    );
  } catch (e) {
    // just re-throwing the error here
    throw e;
  }

  if (response.status === 429) {
    red("Upload limit reached");
    throw new UploadLimitReachedError("Upload limit reached");
  }

  if (!response.ok) {
    red(
      `Failed to upload stats, bad response: "${response.status} - ${response.statusText}"`,
    );
    throw new FailedUploadError("Failed to upload stats");
  }

  green(`Successfully uploaded stats for bundle: ${bundleName}`);
  return true;
}
