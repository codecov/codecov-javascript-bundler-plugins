import td from "testdouble";

import { createEmptyArgs } from "@test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import * as CloudflarePages from "../CloudflarePages.ts";

describe("CloudflarePages Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("calling detect()", () => {
    it("does not run without CloudflarePages env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };

      const detected = CloudflarePages.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with CloudflarePages env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CF_PAGES: "true",
        },
      };

      const detected = CloudflarePages.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("returns the correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CF_PAGES: "true",
        CF_PAGES_COMMIT_SHA: "testingsha",
        CF_PAGES_BRANCH: "main",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "",
      service: "cloudflare-pages",
      slug: "",
    };

    const params = await CloudflarePages.getServiceParams(inputs);
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
        NETLIFY: "true",
        COMMIT_REF: "testingsha",
        BRANCH: "main",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "main",
      build: "2",
      buildURL: "",
      commit: "cool-commit-sha",
      job: "",
      pr: "1",
      service: "cloudflare-pages",
      slug: "testOrg/testRepo",
    };

    const params = await CloudflarePages.getServiceParams(inputs);
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
      service: "cloudflare-pages",
      slug: "",
    };

    const params = await CloudflarePages.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
