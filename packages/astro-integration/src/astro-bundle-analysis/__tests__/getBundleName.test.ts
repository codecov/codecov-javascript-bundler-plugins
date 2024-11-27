import { describe, it, expect } from "vitest";
import { getBundleName } from "../getBundleName";

describe("getBundleName", () => {
  it("appends name if present", () => {
    const name = getBundleName("test-bundle", "client", "iife", undefined);
    expect(name).toBe("test-bundle-client-iife");
  });

  it("returns bundle name with appended format", () => {
    const name = getBundleName("test-bundle", "client", "iife", undefined);
    expect(name).toBe("test-bundle-client-iife");
  });

  it("extends es to esm", () => {
    const name = getBundleName("test-bundle", "server", "es", undefined);
    expect(name).toBe("test-bundle-server-esm");
  });

  it("appends server when present in target", () => {
    const name = getBundleName("test-bundle", "server", "es", undefined);
    expect(name).toBe("test-bundle-server-esm");
  });

  it("appends client when present in target", () => {
    const name = getBundleName("test-bundle", "client", "es", undefined);
    expect(name).toBe("test-bundle-client-esm");
  });
});
