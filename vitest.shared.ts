import { defineConfig } from "vitest/config";

export const config = defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "!**/node_modules/**", "!test/helpers.ts"],
    },
  },
});
