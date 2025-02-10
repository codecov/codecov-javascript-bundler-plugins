import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import * as td from "testdouble";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createEmptyArgs } from "../../../../test-utils/helpers.ts";
import { type ProviderUtilInputs } from "../../../types.ts";
import { Output } from "../../Output.ts";
import { providerList } from "../index.ts";

const server = setupServer(
  http.get(
    "https://api.github.com/repos/:org/:repo/actions/runs/:id/jobs",
    () => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("CI Providers", () => {
  afterEach(() => {
    td.reset();
  });

  describe.each(providerList)(`%s`, (provider) => {
    it(`${provider.getServiceName()} has a service name`, () => {
      expect(typeof provider.getServiceName()).toBe("string");
      expect(provider.getServiceName()).not.toBe("");
    });

    it(`${provider.getServiceName()} has env var names`, () => {
      const envVarNames = provider.getEnvVarNames();

      expect(typeof envVarNames).toBe("object");
      expect(envVarNames.length).toBeGreaterThan(0);

      for (const envVarName of envVarNames) {
        expect(typeof envVarName).toBe("string");
      }
    });

    describe(`${provider.getServiceName()} can return a ProviderServiceParams object that`, () => {
      it("has a sha", async () => {
        const inputs: ProviderUtilInputs = {
          envs: {},
          args: {
            ...createEmptyArgs(),
            ...{
              branch: "main",
              sha: "123",
              slug: "testOrg/testRepo",
            },
          },
        };

        const output = new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "service-test",
            debug: false,
            dryRun: true,
            enableBundleAnalysis: true,
            retryCount: 0,
            telemetry: false,
          },
          { metaFramework: "vite" },
        );

        const serviceParams = await provider.getServiceParams(inputs, output);

        expect(serviceParams).not.toBeNull();
        expect(serviceParams.commit).toEqual(inputs?.args?.sha);
      });

      it("has a slug", async () => {
        const inputs: ProviderUtilInputs = {
          envs: {},
          args: {
            ...createEmptyArgs(),
            ...{
              branch: "main",
              sha: "123",
              slug: "testOrg/testRepo",
            },
          },
        };

        const output = new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "service-test",
            debug: false,
            dryRun: true,
            enableBundleAnalysis: true,
            retryCount: 0,
            telemetry: false,
          },
          { metaFramework: "vite" },
        );

        const serviceParams = await provider.getServiceParams(inputs, output);

        expect(serviceParams).not.toBeNull();
        expect(serviceParams.slug).toEqual(inputs?.args?.slug);
      });
    });
  });
});
