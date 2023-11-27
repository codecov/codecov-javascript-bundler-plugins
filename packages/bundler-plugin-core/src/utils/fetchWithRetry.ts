import { DEFAULT_RETRY_DELAY } from "./constants";
import { delay } from "./delay";

export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retryCount: number,
) => {
  let response = new Response();
  for (let i = 0; i < retryCount; i++) {
    try {
      await delay(DEFAULT_RETRY_DELAY * i);
      response = await fetch(url, options);
      break;
    } catch (err) {
      const isLastAttempt = i + 1 === retryCount;
      if (isLastAttempt) {
        throw err;
      }
    }
  }

  return response;
};
