import { preProcessBody } from "../preProcessBody";

describe("preProcessBody", () => {
  describe("there is a valid value", () => {
    it("does not change the `string`", () => {
      const body = {
        key: "value",
      };

      const result = preProcessBody(body);

      expect(result).toEqual({ key: "value" });
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
