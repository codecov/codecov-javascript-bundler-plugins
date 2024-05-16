import { createEmptyArgs } from "@test-utils/helpers.ts";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as Netlify from "../Netlify.ts";

describe("Netlify Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without Netlify env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      const detected = Netlify.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Netlify env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          NETLIFY: "true",
        },
      };

      const detected = Netlify.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        NETLIFY: "true",
        COMMIT_REF: "testingsha",
        BRANCH: "main",
        BUILD_ID: "2",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
      service: "netlify",
      slug: "",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Netlify-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Netlify.getServiceParams(inputs, output);
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
        BUILD_ID: "2",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "",
      commit: "cool-commit-sha",
      job: "",
      pr: "1",
      service: "netlify",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Netlify-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Netlify.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings", async () => {
    const inputs: ProviderUtilInputs = {
      args: {},
      envs: {},
    };

    const expected: ProviderServiceParams = {
      branch: "",
      build: "",
      buildURL: "",
      commit: "",
      job: "",
      pr: "",
      service: "netlify",
      slug: "",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Netlify-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Netlify.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
