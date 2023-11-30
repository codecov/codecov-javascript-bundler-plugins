import td from "testdouble";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { createEmptyArgs } from "@test-utils/helpers.ts";
import { type ProviderUtilInputs } from "../../../types.ts";
import { providerList } from "../index.ts";

const server = setupServer(
  http.get("https://api.github.com/repos/:org/:repo/actions/runs//jobs", () => {
    return HttpResponse.json({}, { status: 200 });
  }),
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

  describe("check that each provider", () =>
    expect(providerList).toBeInstanceOf(Array));

  providerList.forEach((provider) => {
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

      it("has a sha", async () => {
        const serviceParams = await provider.getServiceParams(inputs);

        expect(serviceParams).not.toBeNull();
        expect(serviceParams.commit).toEqual(inputs?.args?.sha);
      });

      it("has a slug", async () => {
        const serviceParams = await provider.getServiceParams(inputs);

        expect(serviceParams).not.toBeNull();
        expect(serviceParams.slug).toEqual(inputs?.args?.slug);
      });
    });
  });
});
