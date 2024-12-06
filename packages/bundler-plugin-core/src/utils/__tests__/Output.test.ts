import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeAll,
  afterAll,
  type MockInstance,
  type Mock,
  beforeEach,
} from "vitest";
import { type Scope, type Client } from "@sentry/core";
import chalk from "chalk";

import { detectProvider } from "../provider";
import { Output } from "../Output";

vi.mock("../provider");

const mockedDetectProvider = detectProvider as Mock;

afterEach(() => {
  vi.clearAllMocks();
});

let consoleSpy: MockInstance;

interface SetupArgs {
  statsSendError?: boolean;
  statsStatus?: number;
  urlStatus?: number;
  urlData?: object;
  urlRetryCount?: number;
  urlSendError?: boolean;
}

describe("Output", () => {
  function setup({
    statsStatus = 200,
    urlStatus = 200,
    urlData = {},
    statsSendError,
    urlSendError,
  }: SetupArgs) {
    const preSignedUrlBody = vi.fn();
    const statsBody = vi.fn();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => null);

    mockedDetectProvider.mockResolvedValue({
      branch: "main",
      build: "",
      buildURL: "",
      commit: "389e3e1aa720fb5a70d64a77507ef52d68a4fb69",
      job: "",
      pr: "",
      service: "github",
      slug: "codecov/codecov-javascript-bundler-plugins",
    });

    // need to mock out fetch wholly and check to see if it was called with the correct stuff

    const fetchMock = vi
      .spyOn(global, "fetch")
      // pre-signed URL
      // @ts-expect-error - testing fetch
      .mockImplementationOnce(() => {
        if (urlSendError) {
          return Promise.reject(new Error("Failed to fetch pre-signed URL"));
        }

        return Promise.resolve({
          status: urlStatus,
          ok: urlStatus < 300,
          json: () => Promise.resolve(urlData),
        });
      })
      // upload stats
      // @ts-expect-error - testing fetch
      .mockImplementation(() => {
        if (statsSendError) {
          return Promise.reject(new Error("Failed to upload stats"));
        }

        return Promise.resolve({
          status: statsStatus,
          ok: urlStatus < 300,
          json: () => Promise.resolve({}),
        });
      });

    return {
      consoleSpy,
      preSignedUrlBody,
      statsBody,
      fetchMock,
    };
  }

  describe("start method", () => {
    beforeAll(() => {
      vi.useFakeTimers().setSystemTime(1000);
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it("should set builtAt to the current time", () => {
      const output = new Output({
        apiUrl: "http://localhost",
        bundleName: "output-test",
        debug: false,
        dryRun: false,
        enableBundleAnalysis: true,
        retryCount: 1,
        uploadToken: "token",
        telemetry: false,
      });

      output.start();

      expect(output?.builtAt).toBe(1000);
    });
  });

  describe("end method", () => {
    beforeAll(() => {
      vi.useFakeTimers().setSystemTime(1000);
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    describe("builtAt is set", () => {
      it("should set duration to the difference between now and builtAt", () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        expect(output?.duration).toBe(0);
      });
    });

    describe("builtAt is not set", () => {
      it("should set duration to the difference between now and 0", () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.end();
        expect(output?.duration).toBe(1000);
      });
    });
  });

  describe("setPlugin method", () => {
    describe("frozen is not set", () => {
      it("sets the plugin details", () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.setPlugin("test-plugin", "0.0.1");

        expect(output.plugin).toStrictEqual({
          name: "test-plugin",
          version: "0.0.1",
        });
      });
    });

    describe("locking the plugin details", () => {
      it("does not change the plugin details", () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.setPlugin("test-plugin", "0.0.1");
        output.lockPluginDetails();
        output.setPlugin("new-plugin", "1.0.0");

        expect(output.plugin).toStrictEqual({
          name: "test-plugin",
          version: "0.0.1",
        });
      });
    });
  });

  describe("setBundleName method", () => {
    describe("bundle name is not locked", () => {
      it("sets the bundle name", () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.setBundleName("new-bundle");

        expect(output.bundleName).toBe("new-bundle");
      });
    });

    describe("bundle name is locked", () => {
      it("does not change the bundle name", () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.setBundleName("new-bundle");
        output.lockBundleName();
        output.setBundleName("new-bundle");

        expect(output.bundleName).toBe("new-bundle");
      });
    });
  });

  describe("write method", () => {
    describe("dryRun is enabled", () => {
      it("immediately returns", async () => {
        const { preSignedUrlBody } = setup({});
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });
        output.start();
        output.end();

        await output.write();

        expect(preSignedUrlBody).not.toHaveBeenCalled();
      });
    });

    describe("bundle name is not present", () => {
      it("immediately returns", async () => {
        const { preSignedUrlBody } = setup({});

        // @ts-expect-error - no bundle name included for test
        const output = new Output({
          apiUrl: "http://localhost",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
        });

        output.start();
        output.end();

        await output.write();

        expect(preSignedUrlBody).not.toHaveBeenCalled();
      });
    });

    describe("bundle name is empty", () => {
      it("immediately returns", async () => {
        const { preSignedUrlBody } = setup({});
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });
        output.start();
        output.end();

        await output.write();

        expect(preSignedUrlBody).not.toHaveBeenCalled();
      });
    });

    describe("fails to detect provider", () => {
      beforeEach(() => {
        mockedDetectProvider.mockRejectedValue(
          new Error("Failed to detect provider"),
        );
      });

      it("throws an error", async () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        try {
          await output.write();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Failed to detect provider");
        }
      });

      it("logs error when debug is enabled", async () => {
        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: true,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();

        expect(consoleSpy).toHaveBeenCalledWith(
          `[codecov] ${chalk.italic.yellow(
            'Error getting provider: "Error: Failed to detect provider"',
          )}`,
        );
      });

      it("captures a message to sentry", async () => {
        const sentryClient = {
          captureMessage: vi.fn(),
        } as unknown as Client;

        const sentryScope = {
          getClient: vi.fn(),
          setTag: vi.fn(),
          addBreadcrumb: vi.fn(),
        } as unknown as Scope;

        const output = new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "output-test",
            debug: true,
            dryRun: false,
            enableBundleAnalysis: true,
            retryCount: 1,
            uploadToken: "token",
            telemetry: false,
          },
          { sentryClient, sentryScope },
        );

        output.start();
        output.end();

        await output.write();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryClient.captureMessage).toHaveBeenCalledWith(
          "Error in detectProvider",
          "info",
          undefined,
          sentryScope,
        );

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryScope.addBreadcrumb).toHaveBeenCalledWith({
          category: "output.write.detectProvider",
          level: "error",
          data: { error: Error("Failed to detect provider") },
        });
      });
    });

    describe("successful detection of provider", () => {
      it("sets the owner and repo tags", async () => {
        setup({});
        const sentryClient = {
          captureMessage: vi.fn(),
        } as unknown as Client;

        const sentryScope = {
          getClient: vi.fn(),
          setTag: vi.fn(),
          addBreadcrumb: vi.fn(),
        } as unknown as Scope;

        const output = new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "output-test",
            debug: false,
            dryRun: false,
            enableBundleAnalysis: true,
            retryCount: 1,
            uploadToken: "token",
            telemetry: false,
          },
          { sentryClient, sentryScope },
        );

        output.start();
        output.end();

        await output.write();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryScope.setTag).toHaveBeenNthCalledWith(
          1,
          "service",
          "github",
        );
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryScope.setTag).toHaveBeenNthCalledWith(
          2,
          "owner",
          "codecov",
        );
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryScope.setTag).toHaveBeenNthCalledWith(
          3,
          "repo",
          "codecov-javascript-bundler-plugins",
        );
      });
    });

    describe("fails to fetch pre-signed URL", () => {
      it("immediately returns", async () => {
        setup({ urlSendError: true });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();
      });

      it("logs error when debug is enabled", async () => {
        setup({ urlSendError: true });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: true,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();

        expect(consoleSpy).toHaveBeenCalledWith(
          `[codecov] ${chalk.italic.yellow(
            'Error getting pre-signed URL: "Error: Failed to fetch pre-signed URL"',
          )}`,
        );
      });

      it("optionally emits error", async () => {
        setup({ urlSendError: true });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await expect(output.write(true)).rejects.toThrow(
          "Failed to fetch pre-signed URL",
        );
      });

      it("captures message to sentry", async () => {
        setup({ urlSendError: true });

        const sentryClient = {
          captureMessage: vi.fn(),
        } as unknown as Client;

        const sentryScope = {
          getClient: vi.fn(),
          setTag: vi.fn(),
          addBreadcrumb: vi.fn(),
        } as unknown as Scope;

        const output = new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "output-test",
            debug: false,
            dryRun: false,
            enableBundleAnalysis: true,
            retryCount: 1,
            uploadToken: "token",
            telemetry: false,
          },
          { sentryClient, sentryScope },
        );

        output.start();
        output.end();

        await output.write();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryClient.captureMessage).toHaveBeenCalledWith(
          "Error in getPreSignedURL",
          "info",
          undefined,
          sentryScope,
        );

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryScope.addBreadcrumb).toHaveBeenCalledWith({
          category: "output.write.getPreSignedURL",
          level: "error",
          data: { error: Error("Failed to fetch pre-signed URL") },
        });
      });
    });

    describe("successful fetch of pre-signed URL", () => {
      it("passes the correct body information", async () => {
        const { fetchMock } = setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
        });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();

        expect(fetchMock).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost/upload/bundle_analysis/v1",
          {
            method: "POST",
            headers: new Headers({
              Authorization: "token token",
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              branch: "main",
              build: null,
              buildURL: null,
              commit: "389e3e1aa720fb5a70d64a77507ef52d68a4fb69",
              job: null,
              pr: null,
              service: "github",
              slug: "codecov::::codecov-javascript-bundler-plugins",
            }),
          },
        );
      });
    });

    describe("fails to upload stats", () => {
      it("immediately returns", async () => {
        setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
          statsSendError: true,
        });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();
      });

      it("logs error when debug is enabled", async () => {
        setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
          statsSendError: true,
        });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: true,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();

        expect(consoleSpy).toHaveBeenCalledWith(
          `[codecov] ${chalk.italic.yellow(
            'Error uploading stats: "Error: Failed to upload stats"',
          )}`,
        );
      });

      it("optionally emits error", async () => {
        setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
          statsSendError: true,
        });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await expect(output.write(true)).rejects.toThrow(
          "Failed to upload stats",
        );
      });

      it("captures message to sentry", async () => {
        setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
          statsSendError: true,
        });

        const sentryClient = {
          captureMessage: vi.fn(),
        } as unknown as Client;

        const sentryScope = {
          getClient: vi.fn(),
          setTag: vi.fn(),
          addBreadcrumb: vi.fn(),
        } as unknown as Scope;

        const output = new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "output-test",
            debug: false,
            dryRun: false,
            enableBundleAnalysis: true,
            retryCount: 1,
            uploadToken: "token",
            telemetry: false,
          },
          { sentryClient, sentryScope },
        );

        output.start();
        output.end();

        await output.write();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryClient.captureMessage).toHaveBeenCalledWith(
          "Error in uploadStats",
          "error",
          undefined,
          sentryScope,
        );

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(sentryScope.addBreadcrumb).toHaveBeenCalledWith({
          category: "output.write.uploadStats",
          level: "error",
          data: { error: Error("Failed to upload stats") },
        });
      });
    });

    describe("successful uploading of stats", () => {
      it("passes the correct body information", async () => {
        const { fetchMock } = setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
          statsSendError: false,
          statsStatus: 200,
        });

        const output = new Output({
          apiUrl: "http://localhost",
          bundleName: "output-test",
          debug: false,
          dryRun: false,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "token",
          telemetry: false,
        });

        output.start();
        output.end();

        await output.write();

        expect(fetchMock).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost/upload/stats/",
          {
            method: "PUT",
            duplex: "half",
            headers: {
              "Content-Type": "application/json",
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            body: expect.any(ReadableStream),
          },
        );
      });
    });
  });
});
