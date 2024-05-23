import { createEmptyArgs } from "@test-utils/helpers.ts";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as Vercel from "../Vercel.ts";

describe("Vercel Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without Vercel env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      const detected = Vercel.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Vercel env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          VERCEL: "true",
        },
      };

      const detected = Vercel.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        VERCEL: "true",
        VERCEL_GIT_COMMIT_SHA: "testingsha",
        VERCEL_GIT_REPO_SLUG: "testRepo",
        VERCEL_GIT_REPO_OWNER: "testOrg",
        VERCEL_GIT_COMMIT_REF: "super-cool-branch",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "super-cool-branch",
      build: "",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
      service: "vercel",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Vercel-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Vercel.getServiceParams(inputs, output);
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
        VERCEL: "true",
        VERCEL_GIT_COMMIT_SHA: "testingsha",
        VERCEL_GIT_REPO_SLUG: "testRepo",
        VERCEL_GIT_REPO_OWNER: "testOrg",
        VERCEL_GIT_COMMIT_REF: "super-cool-branch",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "",
      commit: "cool-commit-sha",
      job: "",
      pr: "1",
      service: "vercel",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Vercel-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Vercel.getServiceParams(inputs, output);
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
      service: "vercel",
      slug: "",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Vercel-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Vercel.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
