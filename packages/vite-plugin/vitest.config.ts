import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import replace from "@rollup/plugin-replace";
import packageJson from "./package.json";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      include: [
        "src/**/*.ts",
        "src/**/*.tsx",
        "!**/node_modules/**",
        "!test/helpers.ts",
      ],
    },
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
    tsconfigPaths(),
  ],
});
