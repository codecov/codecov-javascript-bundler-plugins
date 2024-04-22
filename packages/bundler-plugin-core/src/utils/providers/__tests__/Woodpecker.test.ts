import { createEmptyArgs } from "@test-utils/helpers.ts";
import * as td from "testdouble";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import * as providerWoodpecker from "../Woodpecker.ts";

describe("Woodpecker Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without Woodpecker env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = providerWoodpecker.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Woodpecker env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "woodpecker",
        },
      };
      const detected = providerWoodpecker.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "woodpecker",
        CI_COMMIT_BRANCH: "master",
        CI_COMMIT_SHA: "testingsha",
        CI_BUILD_NUMBER: "2",
        CI_BUILD_LINK:
          "https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629",
        CI_JOB_NUMBER: "12",
        CI_REPO: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL:
        "https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629",
      commit: "testingsha",
      pr: "",
      job: "12",
      service: "woodpecker",
      slug: "testOrg/testRepo",
    };

    const params = await providerWoodpecker.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for overrides", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "woodpecker",
        CI_COMMIT_BRANCH: "master",
        CI_COMMIT_SOURCE_BRANCH: "new-feature",
        CI_COMMIT_SHA: "testingsha",
        CI_BUILD_NUMBER: "2",
        CI_JOB_NUMBER: "20",
        CI_COMMIT_PULL_REQUEST: "1",
        CI_BUILD_LINK:
          "https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629",
        CI_REPO: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "new-feature",
      build: "2",
      buildURL:
        "https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629",
      commit: "testingsha",
      job: "20",
      pr: "1",
      service: "woodpecker",
      slug: "testOrg/testRepo",
    };

    const params = await providerWoodpecker.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params from defaults", async () => {
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
      service: "woodpecker",
      slug: "",
    };

    const params = await providerWoodpecker.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
