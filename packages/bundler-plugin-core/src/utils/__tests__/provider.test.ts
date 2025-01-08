import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
  type Mock,
} from "vitest";
import { type ProviderUtilInputs } from "../../types.ts";
import { detectProvider, setSlug } from "../provider.ts";
import { isProgramInstalled } from "../isProgramInstalled";
import { Output } from "../Output.ts";
vi.mock("../isProgramInstalled");
const mockedIsProgramInstalled = isProgramInstalled as Mock;

describe("detectProvider", () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => null);
  });

  afterEach(() => {
    consoleSpy.mockReset();
  });

  describe("when provider is detected", () => {
    beforeEach(() => {
      mockedIsProgramInstalled.mockReturnValue(false);
    });

    it("returns the service params", async () => {
      const inputs: ProviderUtilInputs = {
        args: {},
        envs: {
          CI: "true",
          APPVEYOR: "true",
        },
      };

      const output = new Output({
        apiUrl: "http://localhost",
        bundleName: "provider-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      });

      const result = await detectProvider(inputs, output);
      expect(result.service).toEqual("appveyor");
    });
  });

  describe("no provider is detected", () => {
    it("throws an error", async () => {
      let error;

      const output = new Output({
        apiUrl: "http://localhost",
        bundleName: "provider-test",
        debug: false,
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 0,
        telemetry: false,
      });

      try {
        const inputs: ProviderUtilInputs = {
          args: {},
          envs: {},
        };

        await detectProvider(inputs, output);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toEqual("Could not detect provider");
      }
    });
  });
});

describe("setSlug", () => {
  describe("when slugArg is defined and not empty", () => {
    it("returns slugArg", () => {
      const slugArg = "cool-slug";

      const result = setSlug(slugArg, undefined, undefined);
      expect(result).toEqual(slugArg);
    });
  });

  describe("when slugArg is not defined or empty and orgEnv and repoEnv are defined and not empty", () => {
    it("returns orgEnv/repoEnv", () => {
      const orgEnv = "cool-org";
      const repoEnv = "cool-repo";

      const result = setSlug(undefined, orgEnv, repoEnv);
      expect(result).toEqual(`${orgEnv}/${repoEnv}`);
    });
  });

  describe("all values are undefined", () => {
    it("returns an empty string", () => {
      const result = setSlug(undefined, undefined, undefined);
      expect(result).toEqual(null);
    });
  });
});
