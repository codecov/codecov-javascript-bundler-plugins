import { createEmptyArgs } from "@test-utils/helpers.ts";
import childProcess from "child_process";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import * as GitLabCI from "../GitLabCI.ts";

describe("GitLabCI Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without GitLabCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = GitLabCI.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with GitLabCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          GITLAB_CI: "true",
        },
      };
      const detected = GitLabCI.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct empty params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITLAB_CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "",
      build: "",
      buildURL: "",
      commit: "",
      job: "",
      pr: "",
      service: "gitlab",
      slug: "",
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });
    const params = await GitLabCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets correct initial params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI_BUILD_ID: "1",
        CI_BUILD_REF: "testingsha",
        CI_BUILD_REF_NAME: "main",
        CI_COMMIT_REF_NAME: "master",
        CI_COMMIT_SHA: "testsha",
        CI_JOB_ID: "2",
        CI_PROJECT_PATH: "testOrg/testRepo",
        GITLAB_CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
      service: "gitlab",
      slug: "testOrg/testRepo",
    };
    const params = await GitLabCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets correct second params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI_COMMIT_REF_NAME: "master",
        CI_COMMIT_SHA: "testsha",
        CI_JOB_ID: "2",
        CI_PROJECT_PATH: "testOrg/testRepo",
        GITLAB_CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "",
      service: "gitlab",
      slug: "testOrg/testRepo",
    };
    const params = await GitLabCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  describe("getSlug()", () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITLAB_CI: "true",
      },
    };

    it("can get the slug from http", async () => {
      inputs.envs.CI_BUILD_REPO = "https://gitlab.com/testOrg/testRepo.git";
      const params = await GitLabCI.getServiceParams(inputs);
      expect(params.slug).toBe("testOrg/testRepo");
    });

    it("can get the slug from git url", async () => {
      inputs.envs.CI_BUILD_REPO = "git@gitlab.com:testOrg/testRepo.git";
      const params = await GitLabCI.getServiceParams(inputs);
      expect(params.slug).toBe("testOrg/testRepo");
    });

    it("can get the slug from git config", async () => {
      inputs.envs.CI_BUILD_REPO = "";
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("https://gitlab.com/testOrg/testRepo.git"),
      });

      const params = await GitLabCI.getServiceParams(inputs);
      expect(params.slug).toBe("testOrg/testRepo");
    });

    it("can get the slug from git config as /", async () => {
      inputs.envs.CI_BUILD_REPO = "";
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({ stdout: Buffer.from("git@gitlab.com:/") });

      const params = await GitLabCI.getServiceParams(inputs);
      expect(params.slug).toBe("");
    });

    it("can handle no remote origin url", async () => {
      inputs.envs.CI_BUILD_REPO = "";
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({ stdout: Buffer.from("") });

      const params = await GitLabCI.getServiceParams(inputs);
      expect(params.slug).toBe("");
    });
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
        GITLAB_CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "2",
      service: "gitlab",
      slug: "testOrg/testRepo",
    };

    const params = await GitLabCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
