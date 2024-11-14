import replace from "@rollup/plugin-replace";
import { defineProject } from "vitest/config";
import { config, plugins } from "../../vitest.shared";

const packageJson = await import("./package.json");

export default defineProject({
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
    ...plugins,
  ],
});
