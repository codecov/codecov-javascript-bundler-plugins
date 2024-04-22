import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export const plugins = [tsconfigPaths()];

export const config = defineConfig({
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
  plugins,
});
