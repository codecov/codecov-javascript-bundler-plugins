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

    buildStartHelper(output);

    expect(output?.builtAt).toBe(1000);
  });
});
