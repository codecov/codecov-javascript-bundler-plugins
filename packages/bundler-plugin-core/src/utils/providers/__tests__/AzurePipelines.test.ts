import childProcess from "child_process";
import * as td from "testdouble";
import { describe, expect, it } from "vitest";

import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import * as AzurePipelines from "../AzurePipelines.ts";
import { Output } from "../../Output.ts";

describe("Azure Pipelines CI Params", () => {
  describe("detect()", () => {
    it("does not run without AzurePipelines env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = AzurePipelines.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with AzurePipelines env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          SYSTEM_TEAMFOUNDATIONSERVERURI: "true",
        },
      };
      const detected = AzurePipelines.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets empty string if environment variable is undefined", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        SYSTEM_TEAMFOUNDATIONSERVERURI: "https://example.azure.com",
      },
    };
    const expected: ProviderServiceParams = {
      branch: null,
      build: null,
      buildURL: null,
      commit: null,
      job: null,
      pr: null,
      service: "azure_pipelines",
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
        bundleName: "AzurePipelines-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await AzurePipelines.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params on pr number", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILD_BUILDNUMBER: "1",
        BUILD_BUILDID: "2",
        BUILD_REPOSITORY_NAME: "testOrg/testRepo",
        BUILD_SOURCEBRANCH: "refs/heads/main",
        BUILD_SOURCEVERSION: "testingsha",
        SYSTEM_BUILD_BUILDID: "1",
        SYSTEM_PULLREQUEST_PULLREQUESTNUMBER: "3",
        SYSTEM_TEAMFOUNDATIONSERVERURI: "https://example.azure.com",
        SYSTEM_TEAMPROJECT: "testOrg",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://example.azure.comtestOrg/_build/results?buildId=2",
      commit: "testingsha",
      job: "2",
      pr: "3",
      service: "azure_pipelines",
      slug: "testOrg/testRepo",
    };
    const execFileSync = td.replace(childProcess, "execFileSync");
    td.when(
      execFileSync("git", ["show", "--no-patch", "--format=%P"]),
    ).thenReturn(Buffer.from("nonmergesha23456789012345678901234567890"));

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "AzurePipelines-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await AzurePipelines.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params on pr id", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILD_BUILDNUMBER: "1",
        BUILD_BUILDID: "2",
        BUILD_REPOSITORY_NAME: "testOrg/testRepo",
        BUILD_SOURCEBRANCH: "refs/heads/main",
        BUILD_SOURCEVERSION: "testingsha",
        SYSTEM_BUILD_BUILDID: "1",
        SYSTEM_PULLREQUEST_PULLREQUESTID: "3",
        SYSTEM_TEAMFOUNDATIONSERVERURI: "https://example.azure.com",
        SYSTEM_TEAMPROJECT: "testOrg",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://example.azure.comtestOrg/_build/results?buildId=2",
      commit: "testingsha",
      job: "2",
      pr: "3",
      service: "azure_pipelines",
      slug: "testOrg/testRepo",
    };
    const execFileSync = td.replace(childProcess, "execFileSync");
    td.when(
      execFileSync("git", ["show", "--no-patch", "--format=%P"]),
    ).thenReturn(Buffer.from("nonmergesha23456789012345678901234567890"));

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "AzurePipelines-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await AzurePipelines.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct slug by remote address", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILD_BUILDNUMBER: "1",
        BUILD_BUILDID: "2",
        BUILD_SOURCEBRANCH: "refs/heads/main",
        BUILD_SOURCEVERSION: "testingsha",
        SYSTEM_BUILD_BUILDID: "1",
        SYSTEM_TEAMFOUNDATIONSERVERURI: "https://example.azure.com",
        SYSTEM_TEAMPROJECT: "testOrg",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://example.azure.comtestOrg/_build/results?buildId=2",
      commit: "testingsha",
      job: "2",
      pr: null,
      service: "azure_pipelines",
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

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "AzurePipelines-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await AzurePipelines.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params on merge", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BUILD_BUILDNUMBER: "1",
        BUILD_BUILDID: "2",
        BUILD_REPOSITORY_NAME: "testOrg/testRepo",
        BUILD_SOURCEBRANCH: "refs/heads/main",
        BUILD_SOURCEVERSION: "testingsha",
        SYSTEM_BUILD_BUILDID: "1",
        SYSTEM_PULLREQUEST_PULLREQUESTID: "3",
        SYSTEM_TEAMFOUNDATIONSERVERURI: "https://example.azure.com",
        SYSTEM_TEAMPROJECT: "testOrg",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://example.azure.comtestOrg/_build/results?buildId=2",
      commit: "testingmergecommitsha2345678901234567890",
      job: "2",
      pr: "3",
      service: "azure_pipelines",
      slug: "testOrg/testRepo",
    };
    const execFileSync = td.replace(childProcess, "execFileSync");
    td.when(
      execFileSync("git", ["show", "--no-patch", "--format=%P"]),
    ).thenReturn(
      Buffer.from(
        "testingsha123456789012345678901234567890 testingmergecommitsha2345678901234567890",
      ),
    );

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "AzurePipelines-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await AzurePipelines.getServiceParams(inputs, output);
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
          slug: "testOrg/otherTestRepo",
        },
      },
      envs: {
        SYSTEM_TEAMFOUNDATIONSERVERURI: "https://example.azure.com",
        BUILD_REPOSITORY_NAME: "testOrg/testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: null,
      commit: "testsha",
      job: null,
      pr: "2",
      service: "azure_pipelines",
      slug: "testOrg/otherTestRepo",
    };

    const output = new Output(
      {
        apiUrl: "http://localhost",
        bundleName: "AzurePipelines-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      },
      { metaFramework: "vite" },
    );
    const params = await AzurePipelines.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });
});
