import { createEmptyArgs } from "@test-utils/helpers.ts";
import childProcess from "child_process";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import { Output } from "../../Output.ts";
import * as JenkinsCI from "../JenkinsCI.ts";

describe("Jenkins CI Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without JenkinsCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      let detected = JenkinsCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.JENKINS_URL = "";
      detected = JenkinsCI.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with JenkinsCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          JENKINS_URL: "https://example.jenkins.com",
        },
      };
      const detected = JenkinsCI.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILD_NUMBER: "1",
        BUILD_URL: "https://example.jenkins.com",
        CHANGE_ID: "2",
        GIT_BRANCH: "main",
        GIT_COMMIT: "testingsha",
        JENKINS_URL: "https://example.com",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://example.jenkins.com",
      commit: "testingsha",
      job: "",
      pr: "2",
      service: "jenkins",
      slug: "",
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Jenkins-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await JenkinsCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("can get the slug from git config", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILD_NUMBER: "1",
        BUILD_URL: "https://example.jenkins.com",
        CHANGE_ID: "2",
        GIT_BRANCH: "main",
        GIT_COMMIT: "testingsha",
        JENKINS_URL: "https://example.com",
      },
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
      bundleName: "Jenkins-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await JenkinsCI.getServiceParams(inputs, output);
    expect(params.slug).toBe("testOrg/testRepo");
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
        JENKINS_URL: "https://example.com",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "2",
      service: "jenkins",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Jenkins-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await JenkinsCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings when no envs or args are passed", async () => {
    const inputs: ProviderUtilInputs = {
      args: {},
      envs: {},
    };

    const expected: ProviderServiceParams = {
      branch: "",
      build: "",
      buildURL: "",
      commit: "",
      job: "",
      pr: "",
      service: "jenkins",
      slug: "",
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["config", "--get", "remote.origin.url"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from(""),
    });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "Jenkins-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await JenkinsCI.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
