import { defineConfig } from "vitest/config";
import { type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const plugins: PluginOption[] = [tsconfigPaths()];

export const config = defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "!**/node_modules/**", "!test/helpers.ts"],
    },
  },
  plugins,
});
