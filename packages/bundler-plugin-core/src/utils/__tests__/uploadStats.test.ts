import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { uploadStats } from "../uploadStats";
import { FailedUploadError } from "../../errors/FailedUploadError";
import { FailedFetchError } from "../../errors/FailedFetchError";
import { UploadLimitReachedError } from "../../errors/UploadLimitReachedError";

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
  sendError?: boolean;
  status?: number;
}

// TODO - Will re-enable after migration to vitest
describe.skip("uploadStats", () => {
  function setup({ sendError = false, status = 200 }: SetupArgs) {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => null);

    server.use(
      http.put("http://localhost/upload/stats/", async ({ request }) => {
        const reader = request?.body
          ?.pipeThrough(new TextDecoderStream())
          ?.getReader();

        while (true) {
          const temp = await reader?.read();
          if (temp?.done) break;
        }

        if (!sendError) {
          return HttpResponse.json({}, { status });
        }

        return HttpResponse.error();
      }),
    );

    return {
      consoleSpy,
    };
  }

  describe("on a successful request", () => {
    it("returns true", async () => {
      setup({ sendError: false });

      const data = await uploadStats({
        bundleName: "cool-bundle-cjs",
        message: "cool-message",
        preSignedUrl: "http://localhost/upload/stats/",
        retryCount: 0,
      });

      expect(data).toBeTruthy();
    });
  });

  describe("on an unsuccessful request", () => {
    describe("fetch fails", () => {
      it("throws a FailedFetchError", async () => {
        setup({ sendError: true });

        let error;
        try {
          await uploadStats({
            bundleName: "cool-bundle-cjs",
            message: "cool-message",
            preSignedUrl: "",
            retryCount: 1,
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeInstanceOf(FailedFetchError);
      });
    });

    describe("upload limit is reached", () => {
      it("throws an UploadLimitReachedError", async () => {
        setup({ status: 429, sendError: false });

        let error;
        try {
          await uploadStats({
            bundleName: "cool-bundle-cjs",
            message: "cool-message",
            preSignedUrl: "http://localhost/upload/stats/",
            retryCount: 0,
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeInstanceOf(UploadLimitReachedError);
      });
    });

    describe("response is not ok", () => {
      it("throws a FailedUploadError", async () => {
        setup({ sendError: false, status: 400 });

        let error;
        try {
          await uploadStats({
            bundleName: "cool-bundle-cjs",
            message: "cool-message",
            preSignedUrl: "http://localhost/upload/stats/",
            retryCount: 0,
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeInstanceOf(FailedUploadError);
      });
    });
  });
});
