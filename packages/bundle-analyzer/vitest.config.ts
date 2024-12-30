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
