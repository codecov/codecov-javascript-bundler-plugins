import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as TravisCI from "../TravisCI.ts";

describe("TravisCI Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run with Shipable env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      let detected = TravisCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.CI = "true";
      detected = TravisCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.TRAVIS = "true";
      detected = TravisCI.detect(inputs.envs);
      expect(detected).toBeTruthy();

      inputs.envs.SHIPPABLE = "true";
      detected = TravisCI.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with TravisCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          TRAVIS: "true",
        },
      };
      const detected = TravisCI.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        TRAVIS: "true",
        TRAVIS_JOB_NUMBER: "1",
        TRAVIS_BRANCH: "main",
        TRAVIS_TAG: "main",
        TRAVIS_JOB_ID: "2",
        TRAVIS_PULL_REQUEST: "",
        TRAVIS_COMMIT: "testingsha",
        TRAVIS_REPO_SLUG: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: null,
      build: "1",
      buildURL: null,
      commit: "testingsha",
      job: "2",
      pr: "",
      service: "travis",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "TravisCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await TravisCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params on PR", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        TRAVIS: "true",
        TRAVIS_BRANCH: "branch",
        TRAVIS_COMMIT: "testingsha",
        TRAVIS_JOB_ID: "2",
        TRAVIS_JOB_NUMBER: "1",
        TRAVIS_PULL_REQUEST: "",
        TRAVIS_PULL_REQUEST_BRANCH: "branch",
        TRAVIS_PULL_REQUEST_SHA: "testingprsha",
        TRAVIS_REPO_SLUG: "testOrg/testRepo",
        TRAVIS_TAG: "main",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "1",
      buildURL: null,
      commit: "testingprsha",
      job: "2",
      pr: "",
      service: "travis",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "TravisCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await TravisCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params on PR with no pull request branch", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        TRAVIS: "true",
        TRAVIS_BRANCH: "branch",
        TRAVIS_COMMIT: "testingsha",
        TRAVIS_JOB_ID: "2",
        TRAVIS_JOB_NUMBER: "1",
        TRAVIS_PULL_REQUEST: "",
        TRAVIS_PULL_REQUEST_SHA: "testingprsha",
        TRAVIS_REPO_SLUG: "testOrg/testRepo",
        TRAVIS_TAG: "main",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "1",
      buildURL: null,
      commit: "testingprsha",
      job: "2",
      pr: "",
      service: "travis",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "TravisCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await TravisCI.getServiceParams(inputs, output);
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
        TRAVIS: "true",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: "2",
      service: "travis",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "TravisCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await TravisCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings when no envs or args are passed", async () => {
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
      service: "travis",
      slug: null,
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "TravisCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await TravisCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
