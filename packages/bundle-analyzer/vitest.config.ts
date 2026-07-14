import replace from "@rollup/plugin-replace";
import { defineConfig } from "vitest/config";
import { config } from "../../vitest.shared";
import "ts-node/register";

// This file contains vitest configuration for testing the bundle-analyzer
// package that is built using unbuild (rollup)

const packageJson = await import("./package.json", {
  assert: { type: "json" },
});

export default defineConfig({
  ...config,
  test: {
    ...config.test,
    // CLI tests spawn `npx tsx` subprocesses (the first invocation downloads
    // tsx); vitest 3.2 enforces timeouts on synchronous test bodies, so the
    // default 5s is not enough for these process spawns and the build hook.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
  files: ["./setup.ts"],
  transformMode: {
    web: [/\.tsx?$/],
  },
  plugins: [
    // @ts-expect-error - using rollup plugin
    {
      ...replace({
        preventAssignment: true,
        values: {
          __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
          __PACKAGE_NAME__: JSON.stringify(packageJson.name),
        },
      }),
      enforce: "pre",
    },
  ],
});
