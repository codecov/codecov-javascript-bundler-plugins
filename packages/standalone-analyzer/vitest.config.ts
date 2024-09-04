import replace from "@rollup/plugin-replace";
import { defineProject } from "vitest/config";
import { config, plugins } from "../../vitest.shared";
import "ts-node/register";

// This file contains vitest configuration for testing the standalone-analyzer
// package that is built using unbuild (rollup)

const packageJson = await import("./package.json", {
  assert: { type: "json" },
});

const setupTsNode = {
  files: ["./setup.ts"],
  transformMode: {
    web: [/\.tsx?$/],
  },
};

export default defineProject({
  ...config,
  ...setupTsNode,
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
    ...plugins,
  ],
});
