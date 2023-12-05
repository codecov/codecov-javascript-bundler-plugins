import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/main.js",
  output: {
    dir: "dist",
    entryFileNames: "[name]-[hash].js",
  },
  plugins: [
    resolve(),
    commonjs(),
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      dryRun: true,
    }),
  ],
});
