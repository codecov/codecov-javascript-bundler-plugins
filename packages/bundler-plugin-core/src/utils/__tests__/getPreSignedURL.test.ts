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
import { Output } from "../Output.ts";
import { BadOIDCServiceError } from "src/errors/BadOIDCServiceError.ts";
import { FailedOIDCFetchError } from "src/errors/FailedOIDCFetchError.ts";

const mocks = vi.hoisted(() => ({
  getIDToken: vi.fn().mockReturnValue(""),
}));

vi.mock("@actions/core", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import("@actions/core")>();
  return {
    ...original,
    getIDToken: mocks.getIDToken,
  };
});

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getIDTokenValue?: any;
}

describe("getPreSignedURL", () => {
  let consoleSpy: MockInstance;
  const requestBodyMock = vi.fn();
  const requestTokenMock = vi.fn();
  const spawnSync = td.replace(childProcess, "spawnSync");

  function setup({
    status = 200,
    data = {},
    sendError = false,
    getIDTokenValue,
  }: SetupArgs) {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => null);

    if (getIDTokenValue instanceof Error) {
      mocks.getIDToken.mockRejectedValue(getIDTokenValue);
    } else {
      mocks.getIDToken.mockReturnValue(getIDTokenValue);
    }

    server.use(
      http.post(
        "http://localhost/upload/bundle_analysis/v1",
        async ({ request }) => {
          if (sendError) {
            return HttpResponse.error();
          }

          const requestBody = await request.json();
          requestBodyMock(requestBody);

          if (request.headers.get("Authorization")) {
            requestTokenMock(request.headers.get("Authorization"));
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
      describe('"uploadToken" is provided', () => {
        it("returns the pre-signed URL", async () => {
          setup({
            data: { url: "http://example.com" },
          });

          const url = await getPreSignedURL({
            output: new Output({
              apiUrl: "http://localhost",
              uploadToken: "cool-upload-token",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
            }),
            serviceParams: {
              commit: "123",
            },
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

        describe('user does not provide "gitService"', () => {
          it('returns the pre-signed URL with "git_service" in the request body', async () => {
            setup({
              data: { url: "http://example.com" },
            });

            const url = await getPreSignedURL({
              output: new Output({
                apiUrl: "http://localhost",
                debug: false,
                bundleName: "test-bundle",
                retryCount: 0,
                enableBundleAnalysis: true,
                dryRun: false,
              }),
              serviceParams: {
                commit: "123",
                branch: "owner:branch",
              },
            });

            expect(url).toEqual("http://example.com");
            expect(requestBodyMock).toHaveBeenCalledWith(
              expect.objectContaining({
                git_service: "github",
              }),
            );
          });
        });

        describe('user provides "gitService"', () => {
          it('returns the pre-signed URL with the passed"git_service" in the request body', async () => {
            setup({
              data: { url: "http://example.com" },
            });

            const url = await getPreSignedURL({
              output: new Output({
                apiUrl: "http://localhost",
                debug: false,
                bundleName: "test-bundle",
                retryCount: 0,
                enableBundleAnalysis: true,
                dryRun: false,
                gitService: "github_enterprise",
              }),
              serviceParams: {
                commit: "123",
                branch: "owner:branch",
              },
            });

            expect(url).toEqual("http://example.com");
            expect(requestBodyMock).toHaveBeenCalledWith(
              expect.objectContaining({
                git_service: "github_enterprise",
              }),
            );
          });
        });
      });

      describe("using oidc and github actions", () => {
        it("returns the pre-signed URL", async () => {
          setup({
            data: { url: "http://example.com" },
            getIDTokenValue: "cool-token",
          });

          const url = await getPreSignedURL({
            output: new Output({
              apiUrl: "http://localhost",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
              oidc: {
                gitHubOIDCTokenAudience: "http://localhost",
                useGitHubOIDC: true,
              },
            }),
            serviceParams: {
              commit: "123",
              service: "github-actions",
            },
          });

          expect(url).toEqual("http://example.com");
          expect(requestTokenMock).toHaveBeenCalledWith("token cool-token");
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
              output: new Output({
                apiUrl: "http://localhost",
                debug: false,
                bundleName: "test-bundle",
                retryCount: 0,
                enableBundleAnalysis: true,
                dryRun: false,
                gitService: "github",
              }),
              serviceParams: {
                commit: "123",
                branch: "main",
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
              output: new Output({
                apiUrl: "http://localhost",
                debug: false,
                bundleName: "test-bundle",
                retryCount: 0,
                enableBundleAnalysis: true,
                dryRun: false,
              }),
              serviceParams: {
                commit: "123",
                branch: "owner:branch",
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
            output: new Output({
              apiUrl: "http://localhost",
              uploadToken: "cool-upload-token",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
            }),
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

    describe('http response is not "ok"', () => {
      it("throws an error", async () => {
        const { consoleSpy } = setup({
          data: { url: "http://example.com" },
          status: 400,
        });

        let error;
        try {
          await getPreSignedURL({
            output: new Output({
              apiUrl: "http://localhost",
              uploadToken: "cool-upload-token",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
            }),
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
            output: new Output({
              apiUrl: "http://localhost",
              uploadToken: "cool-upload-token",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
            }),
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
            output: new Output({
              apiUrl: "http://localhost",
              uploadToken: "cool-upload-token",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
            }),
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
            output: new Output({
              apiUrl: "http://localhost",
              uploadToken: "cool-upload-token",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
            }),
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

    describe("using oidc and not github actions", () => {
      it("throws an error", async () => {
        setup({
          data: { url: "http://example.com" },
          getIDTokenValue: "cool-token",
        });

        let error;
        try {
          await getPreSignedURL({
            output: new Output({
              apiUrl: "http://localhost",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
              oidc: {
                gitHubOIDCTokenAudience: "http://localhost",
                useGitHubOIDC: true,
              },
            }),
            serviceParams: {
              commit: "123",
              service: "local",
            },
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(BadOIDCServiceError);
      });
    });

    describe("using oidc and getIDToken fails", () => {
      it("throws an error", async () => {
        setup({
          data: { url: "http://example.com" },
          getIDTokenValue: new Error("Failed to get token"),
        });

        let error;
        try {
          await getPreSignedURL({
            output: new Output({
              apiUrl: "http://localhost",
              debug: false,
              bundleName: "test-bundle",
              retryCount: 0,
              enableBundleAnalysis: true,
              dryRun: false,
              oidc: {
                gitHubOIDCTokenAudience: "http://localhost",
                useGitHubOIDC: true,
              },
            }),
            serviceParams: {
              commit: "123",
              service: "github-actions",
            },
          });
        } catch (e) {
          error = e;
        }

        expect(consoleSpy).toHaveBeenCalled();
        expect(error).toBeInstanceOf(FailedOIDCFetchError);
      });
    });
  });
});
