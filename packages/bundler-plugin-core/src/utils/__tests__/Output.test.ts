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
} from "vitest";

import { detectProvider } from "../provider";
import { Output } from "../Output";

vi.mock("../provider");

const mockedDetectProvider = detectProvider as Mock;

afterEach(() => {
  vi.resetAllMocks();
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
        });
        output.start();
        output.end();

        await output.write();

        expect(preSignedUrlBody).not.toHaveBeenCalled();
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
        });

        output.start();
        output.end();

        await output.write();
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
        });

        output.start();
        output.end();

        await output.write();

        expect(fetchMock).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledWith(
          "http://localhost/upload/bundle_analysis/v1",
          {
            method: "POST",
            headers: {
              Authorization: "token token",
              "Content-Type": "application/json",
            },
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
        });

        output.start();
        output.end();

        await output.write();
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
