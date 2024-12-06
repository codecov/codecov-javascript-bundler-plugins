import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as CircleCI from "../CircleCI.ts";

describe("CircleCI Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without CircleCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = CircleCI.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with CircleCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          CIRCLECI: "true",
        },
      };
      const detected = CircleCI.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        CIRCLECI: "true",
        CIRCLE_BRANCH: "master",
        CIRCLE_SHA1: "testingsha",
        CIRCLE_PROJECT_REPONAME: "testRepo",
        CIRCLE_PROJECT_USERNAME: "testOrg",
        CIRCLE_REPOSITORY_URL: "git@github.com:testOrg/testRepo.git",
        CIRCLE_BUILD_NUM: "2",
        CIRCLE_PR_NUMBER: "1",
        CIRCLE_NODE_INDEX: "3",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: null,
      commit: "testingsha",
      job: "3",
      pr: "1",
      service: "circleci",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "CircleCI-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await CircleCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct slug when empty reponame", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        CIRCLECI: "true",
        CIRCLE_BRANCH: "master",
        CIRCLE_SHA1: "testingsha",
        CIRCLE_PROJECT_REPONAME: "",
        CIRCLE_REPOSITORY_URL: "git@github.com:testOrg/testRepo.git",
        CIRCLE_BUILD_NUM: "2",
        CIRCLE_PR_NUMBER: "1",
        CIRCLE_NODE_INDEX: "3",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: null,
      commit: "testingsha",
      job: "3",
      pr: "1",
      service: "circleci",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "CircleCI-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await CircleCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params when overrides are passed", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        branch: "main",
        build: "2",
        pr: "1",
        sha: "cool-commit-sha",
        slug: "testOrg/testRepo",
      },
      envs: {
        CI: "true",
        CIRCLECI: "true",
        CIRCLE_BRANCH: "master",
        CIRCLE_SHA1: "testingsha",
        CIRCLE_PROJECT_REPONAME: "testRepo",
        CIRCLE_PROJECT_USERNAME: "testOrg",
        CIRCLE_REPOSITORY_URL: "git@github.com:testOrg/testRepo.git",
        CIRCLE_BUILD_NUM: "2",
        CIRCLE_PR_NUMBER: "1",
        CIRCLE_NODE_INDEX: "3",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: null,
      commit: "cool-commit-sha",
      job: "3",
      pr: "1",
      service: "circleci",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "CircleCI-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await CircleCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
