import childProcess from "child_process";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";

import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import { Output } from "../../Output.ts";

import * as Bitrise from "../Bitrise.ts";

describe("Bitrise Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without Bitrise env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = Bitrise.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does not run with only CI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
        },
      };
      const detected = Bitrise.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("runs with Bitrise env variables", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          BITRISE_IO: "true",
          CI: "true",
        },
      };
      const detected = Bitrise.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  // This should test that the provider outputs proper default values
  it("gets the correct params on no env variables", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITRISE_IO: "true",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: null,
      build: null,
      buildURL: null,
      commit: null,
      job: null,
      pr: null,
      service: "bitrise",
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
      bundleName: "Bitrise-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await Bitrise.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  // This should test that the provider outputs proper parameters when a push event is created
  it("gets the correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITRISE_BUILD_NUMBER: "2",
        BITRISE_BUILD_URL: "https://bitrise.com/testOrg/testRepo/2",
        BITRISE_GIT_BRANCH: "main",
        BITRISE_IO: "true",
        CI: "true",
        GIT_CLONE_COMMIT_HASH: "testingSha",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "https://bitrise.com/testOrg/testRepo/2",
      commit: "testingSha",
      job: null,
      pr: null,
      service: "bitrise",
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
      bundleName: "Bitrise-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await Bitrise.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params on pr", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITRISE_BUILD_NUMBER: "2",
        BITRISE_BUILD_URL: "https://bitrise.com/testOrg/testRepo/2",
        BITRISE_GIT_BRANCH: "main",
        BITRISE_IO: "true",
        BITRISE_PULL_REQUEST: "3",
        CI: "true",
        GIT_CLONE_COMMIT_HASH: "testingSha",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "https://bitrise.com/testOrg/testRepo/2",
      commit: "testingSha",
      job: null,
      pr: "3",
      service: "bitrise",
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
      bundleName: "Bitrise-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await Bitrise.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  // This should test that the provider outputs proper parameters when given overrides
  it("gets the correct params on overrides", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: "test",
          build: "10",
          pr: "11",
          sha: "otherTestingSha",
          slug: "neworg/newRepo",
        },
      },
      envs: {
        BITRISE_BUILD_NUMBER: "2",
        BITRISE_BUILD_URL: "https://bitrise.com/testOrg/testRepo/2",
        BITRISE_GIT_BRANCH: "main",
        BITRISE_IO: "true",
        BITRISE_PULL_REQUEST: "3",
        CI: "true",
        GIT_CLONE_COMMIT_HASH: "testingSha",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "test",
      build: "10",
      buildURL: "https://bitrise.com/testOrg/testRepo/2",
      commit: "otherTestingSha",
      job: null,
      pr: "11",
      service: "bitrise",
      slug: "neworg/newRepo",
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
      bundleName: "Bitrise-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
      telemetry: false,
    });
    const params = await Bitrise.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
