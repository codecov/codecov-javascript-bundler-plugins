import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import * as AppVeyorCI from "../AppVeyorCI.ts";
import { createEmptyArgs } from "@test-utils/helpers.ts";

describe("AppveyorCI Params", () => {
  describe("detect()", () => {
    it("does not run without AppveyorCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      let detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.CI = "true";
      detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.CI = "True";
      detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.CI = "false";
      inputs.envs.APPVEYOR = "true";
      detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeFalsy();

      inputs.envs.APPVEYOR = "True";
      detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with AppveyorCI env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          APPVEYOR: "true",
        },
      };
      let detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeTruthy();

      inputs.envs.CI = "True";
      inputs.envs.APPVEYOR = "True";
      detected = AppVeyorCI.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params on push", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        APPVEYOR: "true",
        APPVEYOR_ACCOUNT_NAME: "testOrg",
        APPVEYOR_BUILD_ID: "2",
        APPVEYOR_BUILD_VERSION: "3",
        APPVEYOR_JOB_ID: "1",
        APPVEYOR_PROJECT_SLUG: "testRepo",
        APPVEYOR_REPO_BRANCH: "main",
        APPVEYOR_REPO_COMMIT: "testingsha",
        APPVEYOR_REPO_NAME: "testOrg/testRepo",
        APPVEYOR_URL: "https://appveyor.com",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://appveyor.com/project/testOrg/testRepo/builds/2/job/1",
      commit: "testingsha",
      job: "testOrg/testRepo/3",
      pr: "",
      service: "appveyor",
      slug: "testOrg/testRepo",
    };
    const params = await AppVeyorCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for PRs", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        APPVEYOR: "true",
        APPVEYOR_ACCOUNT_NAME: "testOrg",
        APPVEYOR_BUILD_ID: "2",
        APPVEYOR_BUILD_VERSION: "3",
        APPVEYOR_JOB_ID: "1",
        APPVEYOR_PROJECT_SLUG: "testRepo",
        APPVEYOR_PULL_REQUEST_NUMBER: "4",
        APPVEYOR_REPO_BRANCH: "main",
        APPVEYOR_REPO_COMMIT: "testingshamerge",
        APPVEYOR_PULL_REQUEST_HEAD_COMMIT: "testingsha",
        APPVEYOR_REPO_NAME: "testOrg/testRepo",
        APPVEYOR_URL: "https://appveyor.com",
        CI: "true",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "1",
      buildURL: "https://appveyor.com/project/testOrg/testRepo/builds/2/job/1",
      commit: "testingsha",
      job: "testOrg/testRepo/3",
      pr: "4",
      service: "appveyor",
      slug: "testOrg/testRepo",
    };
    const params = await AppVeyorCI.getServiceParams(inputs);
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
        APPVEYOR: "true",
        CI: "true",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "",
      commit: "testsha",
      job: "",
      pr: "2",
      service: "appveyor",
      slug: "testOrg/testRepo",
    };

    const params = await AppVeyorCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings when no envs or args are set", async () => {
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
      service: "appveyor",
      slug: "",
    };

    const params = await AppVeyorCI.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
