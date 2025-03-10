import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as Drone from "../Drone.ts";

describe("Drone Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without Drone env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = Drone.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Drone env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          DRONE: "true",
        },
      };
      const detected = Drone.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        DRONE: "true",
        DRONE_BRANCH: "master",
        DRONE_COMMIT_SHA: "testingsha",
        DRONE_BUILD_NUMBER: "2",
        DRONE_PULL_REQUEST: "1",
        DRONE_BUILD_LINK: "https://www.drone.io/",
        DRONE_REPO: "testOrg/testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "https://www.drone.io/",
      commit: "testingsha",
      job: null,
      pr: "1",
      service: "drone.io",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "Drone-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await Drone.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params from overrides", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: "branch",
          build: "5",
          pr: "123",
          sha: "test-sha",
          slug: "cool-slug",
        },
      },
      envs: {
        CI: "true",
        DRONE: "true",
        DRONE_BRANCH: "master",
        DRONE_COMMIT_SHA: "testingsha",
        DRONE_BUILD_NUMBER: "2",
        DRONE_PULL_REQUEST: "1",
        DRONE_BUILD_LINK: "https://www.drone.io/",
        DRONE_REPO: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "5",
      buildURL: "https://www.drone.io/",
      commit: "test-sha",
      job: null,
      pr: "123",
      service: "drone.io",
      slug: "cool-slug",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "Drone-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await Drone.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for DRONE_BUILD_URL", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        DRONE: "true",
        DRONE_BRANCH: "master",
        DRONE_COMMIT_SHA: "testingsha",
        DRONE_BUILD_NUMBER: "2",
        DRONE_PULL_REQUEST: "1",
        DRONE_BUILD_URL: "https://www.drone.io/",
        DRONE_REPO: "testOrg/testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "https://www.drone.io/",
      commit: "testingsha",
      job: null,
      pr: "1",
      service: "drone.io",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "Drone-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await Drone.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
