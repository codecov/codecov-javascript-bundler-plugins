import { type ProviderServiceParams } from "../../types";
import { detectProvider } from "../provider";
import { Output } from "../Output";

jest.mock("../provider");

const mockedDetectProvider = detectProvider as jest.Mock<
  Promise<ProviderServiceParams>
>;

afterEach(() => {
  jest.resetAllMocks();
});

let consoleSpy: jest.SpyInstance;

interface SetupArgs {
  statsSendError?: boolean;
  statsStatus?: number;
  urlStatus?: number;
  urlData?: object;
  urlRetryCount?: number;
  urlSendError?: boolean;
}

describe.skip("Output", () => {
  function setup({
    statsStatus = 200,
    urlStatus = 200,
    urlData = {},
    statsSendError,
    urlSendError,
  }: SetupArgs) {
    const preSignedUrlBody = jest.fn();
    const statsBody = jest.fn();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => null);

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

    const fetchMock = jest
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
      .mockImplementationOnce(() => {
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
      jest.useFakeTimers().setSystemTime(1000);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should set builtAt to the current time", () => {
      const output: Output = {
        bundleName: "test-bundle",
      };

      buildStartHelper({
        pluginName: "test-plugin",
        pluginVersion: "0.0.1",
        output,
      });

      expect(output?.builtAt).toBe(1000);
      expect(output?.plugin).toStrictEqual({
        name: "test-plugin",
        version: "0.0.1",
      });
    });
  });

  describe("end method", () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(1000);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe("builtAt is set", () => {
      it("should set duration to the difference between now and builtAt", () => {
        const output: Output = {
          bundleName: "test-bundle",
          builtAt: 100,
        };

        buildEndHelper(output);

        expect(output?.duration).toBe(900);
      });
    });

    describe("builtAt is not set", () => {
      it("should set duration to the difference between now and 0", () => {
        const output: Output = {
          bundleName: "test-bundle",
        };

        buildEndHelper(output);

        expect(output?.duration).toBe(1000);
      });
    });
  });

  describe("write method", () => {
    describe("dryRun is enabled", () => {
      it("immediately returns", async () => {
        const { preSignedUrlBody } = setup({});

        await writeBundleHelper({
          options: {
            dryRun: true,
            bundleName: "test",
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            retryCount: 1,
            debug: false,
          },
          output: { bundleName: "test" },
        });

        expect(preSignedUrlBody).not.toHaveBeenCalled();
      });
    });

    describe("bundle name is not present", () => {
      it("immediately returns", async () => {
        const { preSignedUrlBody } = setup({});

        await writeBundleHelper({
          // @ts-expect-error - testing invalid input
          options: {
            dryRun: false,
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            retryCount: 1,
          },
          output: { bundleName: "test" },
        });

        expect(preSignedUrlBody).not.toHaveBeenCalled();
      });
    });

    describe("bundle name is empty", () => {
      it("immediately returns", async () => {
        const { preSignedUrlBody } = setup({});

        await writeBundleHelper({
          options: {
            dryRun: false,
            bundleName: "",
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            retryCount: 1,
            debug: false,
          },
          output: { bundleName: "test" },
        });

        expect(preSignedUrlBody).not.toHaveBeenCalled();
      });
    });

    describe("fails to fetch pre-signed URL", () => {
      it("immediately returns", async () => {
        setup({ urlSendError: true });

        await writeBundleHelper({
          options: {
            dryRun: true,
            bundleName: "test",
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            retryCount: 1,
            debug: false,
          },
          output: { bundleName: "test" },
        });
      });
    });

    describe("successful fetch of pre-signed URL", () => {
      it("passes the correct body information", async () => {
        const { fetchMock } = setup({
          urlData: { url: "http://localhost/upload/stats/" },
          urlStatus: 200,
        });

        await writeBundleHelper({
          options: {
            dryRun: false,
            bundleName: "test",
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            uploadToken: "token",
            retryCount: 1,
            debug: false,
          },
          output: { bundleName: "test", assets: [], modules: [], chunks: [] },
        });

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

        await writeBundleHelper({
          options: {
            dryRun: true,
            bundleName: "test",
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            retryCount: 1,
            debug: false,
          },
          output: { bundleName: "test" },
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

        await writeBundleHelper({
          options: {
            dryRun: false,
            bundleName: "test",
            apiUrl: "http://localhost",
            enableBundleAnalysis: true,
            uploadToken: "token",
            retryCount: 1,
            debug: false,
          },
          output: { bundleName: "test" },
        });

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
