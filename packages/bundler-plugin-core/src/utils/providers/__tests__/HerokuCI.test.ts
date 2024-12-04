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
import * as HerokuCI from "../HerokuCI.ts";

describe("HerokuCI Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without HerokuCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = HerokuCI.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Herokuci env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          HEROKU_TEST_RUN_BRANCH: "test",
        },
      };
      const detected = HerokuCI.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets the correct params on no env variables", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {},
    };
    const expected: ProviderServiceParams = {
      branch: null,
      build: null,
      buildURL: null,
      commit: null,
      job: null,
      pr: null,
      service: "heroku",
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
      bundleName: "Heroku-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await HerokuCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: createEmptyArgs(),
      envs: {
        CI: "true",
        HEROKU_TEST_RUN_BRANCH: "testBranch",
        HEROKU_TEST_RUN_COMMIT_VERSION: "testSha",
        HEROKU_TEST_RUN_ID: "2",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "testBranch",
      build: "2",
      buildURL: null,
      commit: "testSha",
      job: null,
      pr: null,
      service: "heroku",
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
      bundleName: "Heroku-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await HerokuCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params on overrides", async () => {
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
      envs: {},
    };
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: "2",
      service: "heroku",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Heroku-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await HerokuCI.getServiceParams(inputs, output);
    expect(expected).toBeTruthy();
    expect(params).toMatchObject(expected);
  });
});
