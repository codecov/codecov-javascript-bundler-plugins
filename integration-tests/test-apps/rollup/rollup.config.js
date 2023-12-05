import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/main.js",
  output: {
    dir: "dist",
    entryFileNames: "[name]-[hash].js",
  },
  plugins: [
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      dryRun: true,
    }),
  ],
});
