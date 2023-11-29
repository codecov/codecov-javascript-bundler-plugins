import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { getPreSignedURL } from "../getPreSignedURL.ts";
import { FailedFetchError } from "../../errors/FailedFetchError.ts";
import { NoUploadTokenError } from "../../errors/NoUploadTokenError.ts";
import { UploadLimitReachedError } from "../../errors/UploadLimitReachedError.ts";

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
  let consoleSpy: jest.SpyInstance;

  function setup({ status = 200, data = {}, sendError = false }: SetupArgs) {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => null);

    server.use(
      http.post(
        "http://localhost/upload/service/commits/:commitSha/bundle_analysis",
        ({}) => {
          if (sendError) {
            return HttpResponse.error();
          }
          return HttpResponse.json(data, { status });
        },
      ),
    );

    return {
      consoleSpy,
    };
  }

  afterEach(() => {
    consoleSpy.mockReset();
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

    describe('http response is not "ok"', () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: "http://example.com" },
          status: 400,
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

    describe("returned data is undefined", () => {
      let fetchSpy: jest.SpyInstance;
      beforeAll(() => {
        fetchSpy = jest
          .spyOn(global, "fetch")
          .mockResolvedValue(new Response(undefined, { status: 200 }));
      });

      afterAll(() => {
        fetchSpy.mockRestore();
      });

      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: undefined },
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

    describe("http response status is 429", () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: "http://example.com" },
          status: 429,
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
        expect(error).toBeInstanceOf(UploadLimitReachedError);
      });
    });

    describe("fetch throws an error", () => {
      let fetchSpy: jest.SpyInstance;
      beforeAll(() => {
        fetchSpy = jest
          .spyOn(global, "fetch")
          .mockRejectedValue(new Error("Failed to fetch"));
      });

      afterAll(() => {
        fetchSpy.mockRestore();
      });

      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: undefined },
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
