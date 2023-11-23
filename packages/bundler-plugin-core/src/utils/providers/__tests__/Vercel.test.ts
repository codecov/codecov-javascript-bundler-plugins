import td from "testdouble";

import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import * as Vercel from "../Vercel.ts";
import { createEmptyArgs } from "@test-utils/helpers.ts";

describe("Vercel Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without Vercel env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      const detected = Vercel.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Vercel env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          VERCEL: "true",
        },
      };

      const detected = Vercel.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        VERCEL: "true",
        VERCEL_GIT_COMMIT_SHA: "testingsha",
        VERCEL_GIT_REPO_SLUG: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "",
      build: "",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
      service: "vercel",
      slug: "testOrg/testRepo",
    };

    const params = await Vercel.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        branch: "main",
        build: "2",
        parent: "parent-build-sha",
        pr: "1",
        sha: "cool-commit-sha",
        slug: "testOrg/testRepo",
        url: "cool-url.com",
      },
      envs: {
        VERCEL: "true",
        VERCEL_GIT_COMMIT_SHA: "testingsha",
        VERCEL_GIT_REPO_SLUG: "other-org/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "",
      commit: "cool-commit-sha",
      job: "",
      pr: "1",
      service: "vercel",
      slug: "testOrg/testRepo",
    };

    const params = await Vercel.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("defaults to empty strings", async () => {
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
      service: "vercel",
      slug: "",
    };

    const params = await Vercel.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
