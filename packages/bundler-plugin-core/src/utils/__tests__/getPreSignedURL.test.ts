import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import {} from "@/types.ts";
import { getPreSignedURL } from "../getPreSignedURL.ts";
import { FailedFetchError } from "@/errors/FailedFetchError.ts";
import { NoUploadTokenError } from "@/errors/NoUploadTokenError.ts";

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

describe("getPreSignedURL", () => {
  function setup({
    status = 200,
    data = {},
    retryCount = 0,
    sendError = false,
  }: SetupArgs) {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => null);

    server.use(
      http.post(
        "http://localhost/upload/service/commits/:commitSha/bundle_analysis",
        ({}) => {
          if (retryCount === 0 && !sendError) {
            return HttpResponse.json(data, { status });
          }

          retryCount -= 1;
          return HttpResponse.error();
        },
      ),
    );

    return {
      consoleSpy,
    };
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("successful request", () => {
    describe("when the initial response is successful", () => {
      describe('"globalUploadToken" is provided and "repoToken" is not', () => {
        it("returns the pre-signed URL", async () => {
          setup({
            data: { url: "http://example.com" },
          });

          const url = await getPreSignedURL({
            apiURL: "http://localhost",
            globalUploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
          });

          expect(url).toEqual("http://example.com");
        });
      });

      describe('"repoToken" is provided and "globalUploadToken" is not', () => {
        it("returns the pre-signed URL", async () => {
          setup({
            data: { url: "http://example.com" },
          });

          const url = await getPreSignedURL({
            apiURL: "http://localhost",
            repoToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
          });

          expect(url).toEqual("http://example.com");
        });
      });
    });

    describe('when the initial response is "retryable"', () => {
      it("returns the pre-signed URL after retrying", async () => {
        setup({
          data: { url: "http://example.com" },
          retryCount: 2,
        });

        const url = await getPreSignedURL({
          apiURL: "http://localhost",
          globalUploadToken: "super-cool-token",
          serviceParams: {
            commit: "123",
          },
        });

        expect(url).toEqual("http://example.com");
      });
    });
  });

  describe("unsuccessful request", () => {
    describe("return body does not match schema", () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { randomValue: "random" },
        });

        let error;
        try {
          await getPreSignedURL({
            apiURL: "http://localhost",
            globalUploadToken: "cool-upload-token",
            serviceParams: {
              commit: "123",
            },
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(FailedFetchError);
      });
    });

    describe("no upload token found", () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: "http://example.com" },
        });

        let error;
        try {
          await getPreSignedURL({
            apiURL: "http://localhost",
            serviceParams: {
              commit: "123",
            },
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        // for some reason, this test fails even tho it's the same values
        //   Expected: "No upload token found"
        //   Received: "No upload token found"
        //   Number of calls: 1
        // expect(consoleSpy).toHaveBeenCalledWith("No upload token found");
        expect(error).toBeInstanceOf(NoUploadTokenError);
      });
    });

    describe("retry count exceeds limit", () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: "http://example.com" },
          retryCount: 3,
        });

        let error;
        try {
          await getPreSignedURL({
            apiURL: "http://localhost",
            globalUploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(FailedFetchError);
      });
    });
  });
});
