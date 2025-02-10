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
      branch: null,
      build: null,
      buildURL: null,
      commit: null,
      job: null,
      pr: null,
      service: "gitlab",
      slug: null,
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "GLCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await GitLabCI.getServiceParams(inputs, output);
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
      buildURL: null,
      commit: "testingsha",
      job: null,
      pr: null,
      service: "gitlab",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "GLCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await GitLabCI.getServiceParams(inputs, output);
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
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: null,
      service: "gitlab",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "GLCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await GitLabCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  describe("getSlug()", () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITLAB_CI: "true",
      },
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "GLCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );

    it("can get the slug from http", async () => {
      inputs.envs.CI_BUILD_REPO = "https://gitlab.com/testOrg/testRepo.git";

      const params = await GitLabCI.getServiceParams(inputs, output);
      expect(params.slug).toBe("testOrg/testRepo");
    });

    it("can get the slug from git url", async () => {
      inputs.envs.CI_BUILD_REPO = "git@gitlab.com:testOrg/testRepo.git";
      const params = await GitLabCI.getServiceParams(inputs, output);
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

      const params = await GitLabCI.getServiceParams(inputs, output);
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

      const params = await GitLabCI.getServiceParams(inputs, output);
      expect(params.slug).toBe(null);
    });

    it("can handle no remote origin url", async () => {
      inputs.envs.CI_BUILD_REPO = "";
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({ stdout: Buffer.from("") });

      const params = await GitLabCI.getServiceParams(inputs, output);
      expect(params.slug).toBe(null);
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
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: "2",
      service: "gitlab",
      slug: "testOrg/testRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "GLCI-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await GitLabCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
