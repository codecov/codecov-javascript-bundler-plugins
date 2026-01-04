import replace from "@rollup/plugin-replace";
import { defineConfig } from "vitest/config";
import { config } from "../../vitest.shared";

const packageJson = await import("./package.json");

export default defineConfig({
  ...config,
  plugins: [
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
