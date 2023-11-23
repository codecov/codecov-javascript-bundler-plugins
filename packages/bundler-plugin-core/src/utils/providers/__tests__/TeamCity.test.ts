import childProcess from "child_process";
import td from "testdouble";

import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "@/utils/constants.ts";
import * as TeamCity from "../TeamCity.ts";
import { createEmptyArgs } from "@test-utils/helpers.ts";

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
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
      service: "teamcity",
      slug: "",
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });
    const params = await TeamCity.getServiceParams(inputs);
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
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
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
    const params = await TeamCity.getServiceParams(inputs);
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
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "2",
      service: "teamcity",
      slug: "testOrg/testRepo",
    };

    const params = await TeamCity.getServiceParams(inputs);
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
      branch: "",
      build: "",
      buildURL: "",
      commit: "",
      job: "",
      pr: "",
      service: "teamcity",
      slug: "",
    };

    const params = await TeamCity.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
