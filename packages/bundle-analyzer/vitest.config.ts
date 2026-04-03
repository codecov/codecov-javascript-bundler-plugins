import replace from "@rollup/plugin-replace";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { config } from "../../vitest.shared";
import "ts-node/register";

const packageJson = await import("./package.json", {
  with: { type: "json" },
});

const replacePlugin = replace({
  preventAssignment: true,
  values: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
    __PACKAGE_NAME__: JSON.stringify(packageJson.name),
  },
});

export default defineConfig({
  ...config,
  plugins: [
    Object.assign(replacePlugin, { enforce: "pre" as const }) as Plugin,
  ],
});
