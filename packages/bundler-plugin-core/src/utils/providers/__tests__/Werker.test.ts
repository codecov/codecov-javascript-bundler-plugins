import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as Wercker from "../Wercker.ts";

describe("Wercker CI Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without Wercker CI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = Wercker.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Wercker CI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          WERCKER_MAIN_PIPELINE_STARTED: "true",
        },
      };
      const detected = Wercker.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        WERCKER_MAIN_PIPELINE_STARTED: "1",
        WERCKER_GIT_BRANCH: "main",
        WERCKER_GIT_COMMIT: "testingsha",
        WERCKER_GIT_OWNER: "testOrg",
        WERCKER_GIT_REPOSITORY: "testRepo",
        WERCKER_BUILD_URL: "https://example.com/build",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://example.com/build",
      commit: "testingsha",
      job: null,
      pr: null,
      service: "wercker",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Wercker-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Wercker.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for overrides", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: "branch",
          build: "3",
          pr: "2",
          sha: "testsha",
          slug: "testOrg/testRepo",
        },
      },
      envs: {
        CI: "true",
        WERCKER_MAIN_PIPELINE_STARTED: "1",
        WERCKER_GIT_BRANCH: "main",
        WERCKER_GIT_COMMIT: "testingsha",
        WERCKER_GIT_OWNER: "someone",
        WERCKER_GIT_REPOSITORY: "somewhere",
        WERCKER_BUILD_URL: "https://example.com/build",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "https://example.com/build",
      commit: "testsha",
      job: null,
      pr: "2",
      service: "wercker",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Wercker-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Wercker.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params from defaults", async () => {
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
      service: "wercker",
      slug: null,
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Wercker-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Wercker.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
