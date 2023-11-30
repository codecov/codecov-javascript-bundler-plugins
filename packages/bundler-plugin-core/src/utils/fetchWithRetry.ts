import { DEFAULT_RETRY_DELAY } from "./constants";
import { delay } from "./delay";
import { debug, red } from "./logging";

interface FetchWithRetryArgs {
  url: string;
  retryCount: number;
  requestData: RequestInit;
  name?: string;
}

export const fetchWithRetry = async ({
  url,
  retryCount,
  requestData,
  name,
}: FetchWithRetryArgs) => {
  let response = new Response(null, { status: 400 });

  for (let i = 0; i < retryCount + 1; i++) {
    try {
      debug(`Attempting to fetch ${name}, attempt: ${i}`);
      await delay(DEFAULT_RETRY_DELAY * i);
      response = await fetch(url, requestData);
      break;
    } catch (err) {
      debug(`${name} fetch attempt ${i} failed`);
      const isLastAttempt = i + 1 === retryCount;
      if (isLastAttempt) {
        red(`${name} failed after ${i} attempts`);
        throw err;
      }
    }
  }

  return response;
};
