import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
} from "vitest";
import { InvalidSlugError } from "../../errors/InvalidSlugError";
import { preProcessBody } from "../preProcessBody";

describe("preProcessBody", () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => null);
  });

  afterEach(() => {
    consoleSpy.mockReset();
  });

  describe("there is a valid value", () => {
    it("does not change the `string`", () => {
      const body = {
        key: "value",
      };

      const result = preProcessBody(body);

      expect(result).toEqual({ key: "value" });
    });

    describe('the key is "slug"', () => {
      describe("value is not an empty string", () => {
        it('encodes the "slug" value', () => {
          const body = {
            slug: "codecov/engineering/applications-team/gazebo",
          };

          const result = preProcessBody(body);

          expect(result).toEqual({
            slug: "codecov:::engineering:::applications-team::::gazebo",
          });
        });
      });

      describe("value is an empty string", () => {
        it('throws an "InvalidSlugError"', () => {
          const body = {
            slug: "",
          };

          let error;
          try {
            preProcessBody(body);
          } catch (e) {
            error = e;
          }

          expect(error).toBeInstanceOf(InvalidSlugError);
        });
      });
    });
  });

  describe("there is an empty string", () => {
    it("replaces the `string` with `null`", () => {
      const body = {
        key: "",
      };

      const result = preProcessBody(body);

      expect(result).toEqual({ key: null });
    });
  });

  describe("there is an undefined value", () => {
    it("replaces the `undefined` with `null`", () => {
      const body = {
        key: undefined,
      };

      const result = preProcessBody(body);

      expect(result).toEqual({ key: null });
    });
  });
});
