import td from "testdouble";

import { createEmptyArgs } from "@test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import * as Render from "../Render.ts";

describe("Render Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without Render env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      const detected = Render.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Render env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          RENDER: "true",
        },
      };

      const detected = Render.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        RENDER: "true",
        RENDER_GIT_COMMIT: "testing-sha",
        RENDER_GIT_BRANCH: "main",
        RENDER_GIT_REPO_SLUG: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "",
      buildURL: "",
      commit: "testing-sha",
      job: "",
      pr: "",
      service: "render",
      slug: "testOrg/testRepo",
    };

    const params = await Render.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        branch: "main",
        build: "2",
        pr: "1",
        sha: "cool-commit-sha",
        slug: "testOrg/testRepo",
      },
      envs: {
        RENDER: "true",
        RENDER_GIT_COMMIT: "testing-sha",
        RENDER_GIT_BRANCH: "main",
        RENDER_GIT_REPO_SLUG: "testOrg/testRepo",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "",
      commit: "cool-commit-sha",
      job: "",
      pr: "1",
      service: "render",
      slug: "testOrg/testRepo",
    };

    const params = await Render.getServiceParams(inputs);
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
      service: "render",
      slug: "",
    };

    const params = await Render.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
