import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import childProcess from "child_process";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import { Output } from "../../Output.ts";
import * as TeamCity from "../TeamCity.ts";

describe("TeamCity Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without TeamCity env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = TeamCity.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with TeamCity env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          TEAMCITY_VERSION: "true",
        },
      };
      const detected = TeamCity.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        TEAMCITY_VERSION: "true",
        BRANCH_NAME: "main",
        BUILD_VCS_NUMBER: "testingsha",
        BUILD_NUMBER: "1",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: null,
      commit: "testingsha",
      job: null,
      pr: null,
      service: "teamcity",
      slug: null,
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "TeamCity-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await TeamCity.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params and remote slug", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        TEAMCITY_VERSION: "true",
        BRANCH_NAME: "main",
        BUILD_VCS_NUMBER: "testingsha",
        BUILD_NUMBER: "1",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: null,
      commit: "testingsha",
      job: null,
      pr: null,
      service: "teamcity",
      slug: "testOrg/testRepo",
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from("https://github.com/testOrg/testRepo.git"),
    });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "TeamCity-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await TeamCity.getServiceParams(inputs, output);
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
        TEAMCITY_VERSION: "true",
        BRANCH_NAME: "main",
        BUILD_VCS_NUMBER: "testingsha",
        BUILD_NUMBER: "1",
      },
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: "2",
      service: "teamcity",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "TeamCity-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await TeamCity.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings when no envs or args are passed", async () => {
    const inputs: ProviderUtilInputs = {
      args: {},
      envs: {},
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });

    const expected: ProviderServiceParams = {
      branch: null,
      build: null,
      buildURL: null,
      commit: null,
      job: null,
      pr: null,
      service: "teamcity",
      slug: null,
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "TeamCity-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await TeamCity.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
