import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { fetchWithRetry } from "../fetchWithRetry";

jest.mock("../delay.ts");

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

interface SetupArgs {
  status?: number;
  data?: object;
  retryCount?: number;
  sendError?: boolean;
}

describe("fetchWithRetry", () => {
  let consoleSpy: jest.SpyInstance;

  afterEach(() => {
    consoleSpy.mockReset();
  });

  function setup({
    status = 200,
    data = {},
    sendError = false,
    retryCount = 0,
  }: SetupArgs) {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => null);

    server.use(
      http.all("http://localhost", ({}) => {
        if (retryCount === 0 && !sendError) {
          return HttpResponse.json(data, { status });
        }
        retryCount -= 1;
        return HttpResponse.error();
      }),
    );
  }

  describe('when the initial response is "success"', () => {
    it("returns the pre-signed URL", async () => {
      setup({
        data: { url: "http://example.com" },
        retryCount: 0,
      });

      const urlPromise = await fetchWithRetry({
        url: "http://localhost",
        requestData: {},
        retryCount: 3,
      });
      const data = (await urlPromise.json()) as { url: string };

      expect(data?.url).toBe("http://example.com");
    });
  });

  describe('when the initial response is "retryable"', () => {
    it("returns the pre-signed URL after retrying", async () => {
      setup({
        data: { url: "http://example.com" },
        retryCount: 2,
      });

      const urlPromise = await fetchWithRetry({
        url: "http://localhost",
        requestData: {},
        retryCount: 3,
      });
      const data = (await urlPromise.json()) as { url: string };

      expect(data?.url).toBe("http://example.com");
    });
  });

  describe("retry count exceeds limit", () => {
    it("throws an error", async () => {
      setup({
        data: { url: "http://example.com" },
        retryCount: 2,
        sendError: true,
      });

      let error;
      try {
        await fetchWithRetry({
          url: "http://localhost",
          requestData: {},
          retryCount: 1,
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(TypeError);
    });
  });
});
