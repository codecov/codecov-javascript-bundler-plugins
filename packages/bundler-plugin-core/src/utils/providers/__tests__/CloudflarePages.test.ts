import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as CloudflarePages from "../CloudflarePages.ts";

describe("CloudflarePages Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without CloudflarePages env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      const detected = CloudflarePages.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with CloudflarePages env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CF_PAGES: "true",
        },
      };

      const detected = CloudflarePages.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CF_PAGES: "true",
        CF_PAGES_COMMIT_SHA: "testingsha",
        CF_PAGES_BRANCH: "main",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: null,
      buildURL: null,
      commit: "testingsha",
      job: null,
      pr: null,
      service: "cloudflare-pages",
      slug: null,
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "CloudflarePages-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await CloudflarePages.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        branch: "main",
        build: "2",
        pr: "1",
        sha: "cool-commit-sha",
        slug: "testOrg/testRepo",
      },
      envs: {
        NETLIFY: "true",
        COMMIT_REF: "testingsha",
        BRANCH: "main",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: null,
      commit: "cool-commit-sha",
      job: null,
      pr: "1",
      service: "cloudflare-pages",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "CloudflarePages-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await CloudflarePages.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings", async () => {
    const inputs: ProviderUtilInputs = {
      args: {},
      envs: {},
    };

    const expected: ProviderServiceParams = {
      branch: null,
      build: null,
      buildURL: null,
      commit: null,
      job: null,
      pr: null,
      service: "cloudflare-pages",
      slug: null,
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "CloudflarePages-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await CloudflarePages.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
