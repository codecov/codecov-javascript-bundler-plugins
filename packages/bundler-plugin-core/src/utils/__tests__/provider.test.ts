import { type ProviderUtilInputs } from "src/types.ts";
import { detectProvider, setSlug } from "../provider.ts";
import { isProgramInstalled } from "../isProgramInstalled";

jest.mock("../isProgramInstalled");
const mockedIsProgramInstalled = isProgramInstalled as jest.Mock;

describe("detectProvider", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => null);
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

      const result = await detectProvider(inputs);

      expect(result.service).toEqual("appveyor");
    });
  });

  describe("no provider is detected", () => {
    it("throws an error", async () => {
      let error;

      try {
        const inputs: ProviderUtilInputs = {
          args: {},
          envs: {},
        };

        await detectProvider(inputs);
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
      expect(result).toEqual("");
    });
  });
});
