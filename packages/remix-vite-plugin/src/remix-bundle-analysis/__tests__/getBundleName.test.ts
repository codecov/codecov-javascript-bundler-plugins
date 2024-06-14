import { describe, it, expect } from "vitest";
import { getBundleName } from "../getBundleName";

describe("getBundleName", () => {
  it("appends name if present", () => {
    const name = getBundleName("test-bundle", "", "iife", "test");
    expect(name).toBe("test-bundle-test-iife");
  });

  it("returns bundle name with appended format", () => {
    const name = getBundleName("test-bundle", "", "iife", undefined);
    expect(name).toBe("test-bundle-iife");
  });

  it("extends es to esm", () => {
    const name = getBundleName("test-bundle", "", "es", undefined);
    expect(name).toBe("test-bundle-esm");
  });

  it("appends server when present in dir", () => {
    const name = getBundleName(
      "test-bundle",
      "/codecov-javascript-bundler-plugins/examples/sveltekit/.svelte-kit/output/server",
      "es",
      undefined,
    );
    expect(name).toBe("test-bundle-server-esm");
  });

  it("appends client when present in dir", () => {
    const name = getBundleName(
      "test-bundle",
      "/codecov-javascript-bundler-plugins/examples/sveltekit/.svelte-kit/output/client",
      "es",
      undefined,
    );
    expect(name).toBe("test-bundle-client-esm");
  });
});
