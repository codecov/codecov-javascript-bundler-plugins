import { type SentryClient } from "../sentry.ts";
import { BadResponseError } from "../errors/BadResponseError";
import { DEFAULT_RETRY_DELAY } from "./constants";
import { delay } from "./delay";
import { debug, red } from "./logging";

interface FetchWithRetryArgs {
  url: string;
  retryCount: number;
  requestData: RequestInit;
  name?: string;
  sentryClient?: SentryClient;
}

export const fetchWithRetry = async ({
  url,
  retryCount,
  requestData,
  name,
  sentryClient,
}: FetchWithRetryArgs) => {
  let response = new Response(null, { status: 400 });
  let retryCounter = 0;

  for (let i = 0; i < retryCount + 1; i++) {
    try {
      debug(`Attempting to fetch \`${name}\`, attempt: ${i}`);
      await delay(DEFAULT_RETRY_DELAY * i);
      response = await fetch(url, requestData);

      if (!response.ok) {
        throw new BadResponseError("Response not ok");
      }
      break;
    } catch (err) {
      debug(`\`${name}\` fetch attempt ${i} failed`);
      const isLastAttempt = i + 1 === retryCount;
      retryCounter = i;

      if (isLastAttempt) {
        red(`${name} failed after ${i} attempts`);

        if (!(err instanceof BadResponseError)) {
          throw err;
        }

        sentryClient?.metricsAggregator?.add(
          "g",
          `fetch.${name}`,
          retryCounter,
        );
        return response;
      }
    }
  }

  sentryClient?.metricsAggregator?.add("g", `fetch.${name}`, retryCounter);
  return response;
};
