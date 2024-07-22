import { createEmptyArgs } from "@test-utils/helpers.ts";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as Buildkite from "../Buildkite.ts";

describe("Buildkite Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without Buildkite env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = Buildkite.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does not run without Buildkite env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          BUILDKITE: "true",
        },
      };
      const detected = Buildkite.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILDKITE: "true",
        BUILDKITE_BUILD_NUMBER: "1",
        BUILDKITE_JOB_ID: "3",
        BUILDKITE_ORGANIZATION_SLUG: "testOrg",
        BUILDKITE_PIPELINE_SLUG: "testRepo",
        BUILDKITE_BRANCH: "main",
        BUILDKITE_COMMIT: "testingsha",
        BUILDKITE_BUILD_URL: "https://buildkite.com/testOrg/testRepo",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://buildkite.com/testOrg/testRepo",
      commit: "testingsha",
      job: "3",
      pr: null,
      service: "buildkite",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Buildkite-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Buildkite.getServiceParams(inputs, output);
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
        BUILDKITE: "true",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: "2",
      service: "buildkite",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Buildkite-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await Buildkite.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
