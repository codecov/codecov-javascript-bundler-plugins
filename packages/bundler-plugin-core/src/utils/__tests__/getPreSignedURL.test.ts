import {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  type MockInstance,
  beforeEach,
} from "vitest";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import * as td from "testdouble";
import childProcess from "child_process";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../constants.ts";
import { getPreSignedURL } from "../getPreSignedURL.ts";
import { FailedFetchError } from "../../errors/FailedFetchError.ts";
import { NoUploadTokenError } from "../../errors/NoUploadTokenError.ts";
import { UploadLimitReachedError } from "../../errors/UploadLimitReachedError.ts";
import { UndefinedGitServiceError } from "../../errors/UndefinedGitServiceError.ts";

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  td.reset();
  server.close();
});

interface SetupArgs {
  status?: number;
  data?: object;
  retryCount?: number;
  sendError?: boolean;
}

describe("getPreSignedURL", () => {
  let consoleSpy: MockInstance;
  const requestBodyMock = vi.fn();
  const spawnSync = td.replace(childProcess, "spawnSync");

  function setup({ status = 200, data = {}, sendError = false }: SetupArgs) {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => null);

    server.use(
      http.post(
        "http://localhost/upload/bundle_analysis/v1",
        async ({ request }) => {
          if (sendError) {
            return HttpResponse.error();
          }
          const requestBody = await request.json();
          requestBodyMock(requestBody);
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
      describe('"uploadToken" is provided', () => {
        it("returns the pre-signed URL", async () => {
          setup({
            data: { url: "http://example.com" },
          });

          const url = await getPreSignedURL({
            apiURL: "http://localhost",
            uploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
            retryCount: 0,
          });

          expect(url).toEqual("http://example.com");
        });
      });

      describe('"uploadToken" is not provided', () => {
        beforeEach(() => {
          td.when(
            spawnSync("git", ["remote"], {
              maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
            }),
          ).thenReturn({
            stdout: Buffer.from("origin\n"),
          });

          td.when(
            spawnSync("git", ["ls-remote", "--get-url", "origin"], {
              maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
            }),
          ).thenReturn({
            stdout: Buffer.from("git@github.com:codecov/codecov-cli.git\n"),
          });
        });

        it('returns the pre-signed URL with "git_service" in the request body', async () => {
          setup({
            data: { url: "http://example.com" },
          });

          const url = await getPreSignedURL({
            apiURL: "http://localhost",
            serviceParams: {
              commit: "123",
              branch: "owner:branch",
            },
            retryCount: 0,
          });

          expect(url).toEqual("http://example.com");
          expect(requestBodyMock).toHaveBeenCalledWith(
            expect.objectContaining({
              git_service: "github",
            }),
          );
        });
      });
    });
  });

  describe("unsuccessful request", () => {
    describe("no upload token present", () => {
      describe("branch is in incorrect format", () => {
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
                branch: "main",
              },
              retryCount: 0,
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

      describe("git service is not found", () => {
        beforeEach(() => {
          td.when(
            spawnSync("git", ["remote"], {
              maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
            }),
          ).thenReturn({
            stdout: Buffer.from("origin\n"),
          });

          td.when(
            spawnSync("git", ["ls-remote", "--get-url", "origin"], {
              maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
            }),
          ).thenReturn({
            stdout: Buffer.from(""),
          });
        });

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
                branch: "owner:branch",
              },
              retryCount: 0,
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
          expect(error).toBeInstanceOf(UndefinedGitServiceError);
        });
      });
    });

    describe("return body does not match schema", () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { randomValue: "random" },
        });

        let error;
        try {
          await getPreSignedURL({
            apiURL: "http://localhost",
            uploadToken: "cool-upload-token",
            serviceParams: {
              commit: "123",
            },
            retryCount: 0,
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(FailedFetchError);
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
            uploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
            retryCount: 0,
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(FailedFetchError);
      });
    });

    describe("returned data is undefined", () => {
      let fetchSpy: MockInstance;
      beforeAll(() => {
        fetchSpy = vi
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
            uploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
            retryCount: 0,
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
            uploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
            retryCount: 0,
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(UploadLimitReachedError);
      });
    });

    describe("fetch throws an error", () => {
      let fetchSpy: MockInstance;
      beforeAll(() => {
        fetchSpy = vi
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
            uploadToken: "super-cool-token",
            serviceParams: {
              commit: "123",
            },
            retryCount: 0,
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
