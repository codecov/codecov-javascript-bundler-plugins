import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

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
  plugins: [tsconfigPaths()],
});
