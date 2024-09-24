import { BadResponseError } from "../errors/BadResponseError";
import { DEFAULT_RETRY_DELAY, DEFAULT_RETRY_COUNT } from "./constants";
import { delay } from "./delay";
import { debug, red } from "./logging";

interface FetchWithRetryArgs {
  url: string;
  retryCount?: number;
  requestData: RequestInit;
  name?: string;
}

export const fetchWithRetry = async ({
  url,
  retryCount = DEFAULT_RETRY_COUNT,
  requestData,
  name,
}: FetchWithRetryArgs) => {
  let response = new Response(null, { status: 400 });

  for (let i = 0; i < retryCount + 1; i++) {
    try {
      debug(`Attempting to fetch ${name} from: ${url}, attempt: ${i + 1}`);
      await delay(DEFAULT_RETRY_DELAY * i);

      response = await fetch(url, requestData);

      if (!response.ok) {
        throw new BadResponseError("Response not ok");
      }
      break;
    } catch (err) {
      debug(`${name} fetch attempt ${i + 1} failed`);
      const isLastAttempt = i + 1 === retryCount;

      if (isLastAttempt) {
        red(`${name} failed after ${i + 1} attempts`);

        if (!(err instanceof BadResponseError)) {
          throw err;
        }
        return response;
      }
    }
  }

  return response;
};
