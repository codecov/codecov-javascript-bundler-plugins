import td from "testdouble";

import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import * as CodeBuild from "../CodeBuild.ts";
import { createEmptyArgs } from "@test-utils/helpers.ts";

describe("CodeBuild Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without CodeBuild env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = CodeBuild.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with CodeBuild env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          CODEBUILD_CI: "true",
        },
      };
      const detected = CodeBuild.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  describe("getServiceParams()", () => {
    it("gets correct params", async () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          CODEBUILD_CI: "true",
          CODEBUILD_WEBHOOK_HEAD_REF: "refs/heads/master",
          CODEBUILD_RESOLVED_SOURCE_VERSION: "testingsha",
          CODEBUILD_BUILD_ID: "2",
          CODEBUILD_SOURCE_VERSION: "pr/1",
          CODEBUILD_SOURCE_REPO_URL: "https://github.com/repo.git",
        },
      };
      const expected: ProviderServiceParams = {
        branch: "master",
        build: "2",
        buildURL: "",
        commit: "testingsha",
        job: "2",
        pr: "1",
        service: "codebuild",
        slug: "repo",
      };
      const params = await CodeBuild.getServiceParams(inputs);
      expect(params).toMatchObject(expected);
    });

    it("gets correct params for overrides", async () => {
      const inputs: ProviderUtilInputs = {
        args: {
          ...createEmptyArgs(),
          ...{
            branch: "branch",
            build: "3",
            pr: "7",
            sha: "testsha",
            slug: "testOrg/testRepo",
          },
        },
        envs: {
          CI: "true",
          CODEBUILD_CI: "true",
          CODEBUILD_WEBHOOK_HEAD_REF: "refs/heads/master",
          CODEBUILD_RESOLVED_SOURCE_VERSION: "testingsha",
          CODEBUILD_BUILD_ID: "2",
          CODEBUILD_SOURCE_VERSION: "pr/1",
          CODEBUILD_SOURCE_REPO_URL: "https://github.com/repo.git",
        },
      };
      const expected: ProviderServiceParams = {
        branch: "branch",
        build: "3",
        buildURL: "",
        commit: "testsha",
        job: "2",
        pr: "7",
        service: "codebuild",
        slug: "testOrg/testRepo",
      };

      const params = await CodeBuild.getServiceParams(inputs);
      expect(params).toMatchObject(expected);
    });
  });
});
