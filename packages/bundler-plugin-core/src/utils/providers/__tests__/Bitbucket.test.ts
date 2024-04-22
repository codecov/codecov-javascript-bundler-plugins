import childProcess from "child_process";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";

import { createEmptyArgs } from "@test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import * as Bitbucket from "../Bitbucket.ts";

describe("Bitbucket Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without Bitbucket env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      let detected = Bitbucket.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.CI = "true";
      detected = Bitbucket.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does not run without Bitbucket env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          BITBUCKET_BUILD_NUMBER: "1",
          CI: "true",
        },
      };
      const detected = Bitbucket.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets the correct params on no env variables", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITBUCKET_BUILD_NUMBER: "1",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "",
      build: "1",
      buildURL: "",
      commit: "",
      job: "1",
      pr: "",
      service: "bitbucket",
      slug: "",
    };
    const params = await Bitbucket.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params on pr", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITBUCKET_BRANCH: "main",
        BITBUCKET_BUILD_NUMBER: "1",
        BITBUCKET_COMMIT: "testingsha",
        BITBUCKET_PR_ID: "2",
        BITBUCKET_REPO_FULL_NAME: "testOwner/testSlug",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "",
      commit: "testingsha",
      job: "1",
      pr: "2",
      service: "bitbucket",
      slug: "testOwner/testSlug",
    };
    const params = await Bitbucket.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITBUCKET_BRANCH: "main",
        BITBUCKET_BUILD_NUMBER: "1",
        BITBUCKET_COMMIT: "testingsha",
        BITBUCKET_REPO_FULL_NAME: "testOwner/testSlug",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "",
      commit: "testingsha",
      job: "1",
      pr: "",
      service: "bitbucket",
      slug: "testOwner/testSlug",
    };
    const params = await Bitbucket.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params with short SHA", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        BITBUCKET_BRANCH: "main",
        BITBUCKET_BUILD_NUMBER: "1",
        BITBUCKET_COMMIT: "763c55379e35",
        BITBUCKET_REPO_FULL_NAME: "testOwner/testSlug",
        CI: "true",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "",
      commit: "0e8f15380b54",
      job: "1",
      pr: "",
      service: "bitbucket",
      slug: "testOwner/testSlug",
    };

    const execFileSync = td.replace(childProcess, "spawnSync");
    td.when(
      execFileSync("git", ["rev-parse", "763c55379e35"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("0e8f15380b54") });

    const params = await Bitbucket.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets the correct params on overrides", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: "feature",
          build: "3",
          pr: "4",
          sha: "overwriteSha",
          slug: "overwriteOwner/overwriteRepo",
        },
      },
      envs: {
        BITBUCKET_BRANCH: "main",
        BITBUCKET_BUILD_NUMBER: "1",
        BITBUCKET_COMMIT: "testingsha",
        BITBUCKET_PR_ID: "2",
        BITBUCKET_REPO_FULL_NAME: "testOwner/testSlug",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "feature",
      build: "3",
      buildURL: "",
      commit: "overwriteSha",
      job: "1",
      pr: "4",
      service: "bitbucket",
      slug: "overwriteOwner/overwriteRepo",
    };
    const params = await Bitbucket.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
