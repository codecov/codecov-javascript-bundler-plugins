import { type SentryClient } from "../sentry.ts";
import { BadResponseError } from "../errors/BadResponseError";
import { DEFAULT_RETRY_DELAY } from "./constants";
import { delay } from "./delay";
import { debug, red } from "./logging";

interface CreateGaugeArgs {
  bundler: string;
  sentryClient: SentryClient;
}

export type Gauge = ReturnType<typeof createGauge>;

export const createGauge =
  ({ bundler, sentryClient }: CreateGaugeArgs) =>
  (name: string, count: number) => {
    sentryClient?.metricsAggregator?.add("g", `fetch.${name}`, count, "none", {
      bundler,
    });
  };

interface FetchWithRetryArgs {
  url: string;
  retryCount: number;
  requestData: RequestInit;
  name?: string;
  gauge?: Gauge;
}

export const fetchWithRetry = async ({
  url,
  retryCount,
  requestData,
  name,
  gauge,
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
        if (gauge && name) {
          gauge(name, retryCounter + 1);
        }
        return response;
      }
    }
  }

  if (gauge && name) {
    gauge(name, retryCounter + 1);
  }
  return response;
};
