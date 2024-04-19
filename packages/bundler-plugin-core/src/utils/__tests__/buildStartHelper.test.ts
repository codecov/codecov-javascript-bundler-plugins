import { type Output } from "../../types";
import { buildStartHelper } from "../buildStartHelper";

describe("buildStartHelper", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1000);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should set builtAt to the current time", () => {
    const output: Output = {
      bundleName: "test-bundle",
    };

    buildStartHelper({
      pluginName: "test-plugin",
      pluginVersion: "0.0.1",
      output,
    });

    expect(output?.builtAt).toBe(1000);
    expect(output?.plugin).toStrictEqual({
      name: "test-plugin",
      version: "0.0.1",
    });
  });
});
