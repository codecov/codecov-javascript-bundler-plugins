import td from "testdouble";

import { createEmptyArgs } from "@test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import * as Cirrus from "../Cirrus.ts";

describe("Cirrus Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without Cirrus env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = Cirrus.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Cirrus env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          CIRRUS_CI: "true",
        },
      };
      const detected = Cirrus.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        CIRRUS_CI: "true",
        CIRRUS_BRANCH: "master",
        CIRRUS_CHANGE_IN_REPO: "testingsha",
        CIRRUS_BUILD_ID: "2",
        CIRRUS_PR: "1",
        CIRRUS_REPO_OWNER: "testOrg",
        CIRRUS_REPO_NAME: "testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "1",
      service: "cirrus-ci",
      slug: "testOrg/testRepo",
    };
    const params = await Cirrus.getServiceParams(inputs);
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
        CIRRUS_CI: "true",
        CIRRUS_BRANCH: "master",
        CIRRUS_CHANGE_IN_REPO: "testingsha",
        CIRRUS_BUILD_ID: "2",
        CIRRUS_PR: "1",
        CIRRUS_REPO_OWNER: "testOrg",
        CIRRUS_REPO_NAME: "testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "2",
      service: "cirrus-ci",
      slug: "testOrg/testRepo",
    };

    const params = await Cirrus.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
