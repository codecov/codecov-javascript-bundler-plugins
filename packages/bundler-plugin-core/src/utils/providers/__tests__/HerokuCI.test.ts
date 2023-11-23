import childProcess from "child_process";
import td from "testdouble";

import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "@/utils/constants.ts";
import * as HerokuCI from "../HerokuCI.ts";
import { createEmptyArgs } from "@test-utils/helpers.ts";

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
      branch: "",
      build: "",
      buildURL: "",
      commit: "",
      job: "",
      pr: "",
      service: "heroku",
      slug: "",
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });
    const params = await HerokuCI.getServiceParams(inputs);
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
      buildURL: "",
      commit: "testSha",
      job: "",
      pr: "",
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
    const params = await HerokuCI.getServiceParams(inputs);
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
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "2",
      service: "heroku",
      slug: "testOrg/testRepo",
    };
    const params = await HerokuCI.getServiceParams(inputs);
    expect(expected).toBeTruthy();
    expect(params).toMatchObject(expected);
  });
});
