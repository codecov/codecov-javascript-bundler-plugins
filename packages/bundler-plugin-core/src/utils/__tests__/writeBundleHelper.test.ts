import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { writeBundleHelper } from "../writeBundleHelper";
import { detectProvider } from "../provider";
import { type ProviderServiceParams } from "../../types";

jest.mock("../provider");

const mockedDetectProvider = detectProvider as jest.Mock<
  Promise<ProviderServiceParams>
>;

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  jest.resetAllMocks();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
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

describe("writeBundleHelper", () => {
  function setup({
    statsSendError = false,
    statsStatus = 200,
    urlStatus = 200,
    urlData = {},
    urlSendError = false,
  }: SetupArgs) {
    const preSignedUrlBody = jest.fn();
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

    server.use(
      http.post(
        "http://localhost/upload/bundle_analysis/v1",
        async ({ request }) => {
          if (urlSendError) {
            return HttpResponse.error();
          }
          const body = await request.json();
          preSignedUrlBody(body);

          return HttpResponse.json(urlData, { status: urlStatus });
        },
      ),
      http.put("http://localhost/upload/stats/", async ({ request }) => {
        const reader = request?.body
          ?.pipeThrough(new TextDecoderStream())
          ?.getReader();

        while (true) {
          const temp = await reader?.read();
          if (temp?.done) break;
        }

        if (!statsSendError) {
          return HttpResponse.json({}, { status: statsStatus });
        }

        return HttpResponse.error();
      }),
    );

    return {
      consoleSpy,
      preSignedUrlBody,
    };
  }

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
        },
        output: { bundleName: "test" },
      });

      expect(preSignedUrlBody).not.toHaveBeenCalled();
    });
  });

  describe("fails to fetch pre-signed URL", () => {
    it("immediately returns", async () => {
      setup({});

      await writeBundleHelper({
        options: {
          dryRun: true,
          bundleName: "test",
          apiUrl: "http://localhost",
          enableBundleAnalysis: true,
          retryCount: 1,
        },
        output: { bundleName: "test" },
      });
    });
  });

  describe.skip("successful fetch of pre-signed URL", () => {
    it("passes the correct body information", async () => {
      const { preSignedUrlBody } = setup({
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
        },
        output: { bundleName: "test" },
      });

      expect(preSignedUrlBody).toHaveBeenCalledWith({
        branch: "main",
        build: null,
        buildURL: null,
        commit: "389e3e1aa720fb5a70d64a77507ef52d68a4fb69",
        job: null,
        pr: null,
        service: "github",
        slug: "codecov::::codecov-javascript-bundler-plugins",
      });
    });
  });

  describe.skip("fails to upload stats", () => {
    it("immediately returns", async () => {
      setup({});

      await writeBundleHelper({
        options: {
          dryRun: true,
          bundleName: "test",
          apiUrl: "http://localhost",
          enableBundleAnalysis: true,
          retryCount: 1,
        },
        output: { bundleName: "test" },
      });
    });
  });
});
