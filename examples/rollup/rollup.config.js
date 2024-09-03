import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";
import { defineConfig } from "rollup";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default defineConfig({
  input: "src/main.js",
  output: {
    dir: "dist",
    format: "iife", // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: "@codecov/example-rollup-app",
      apiUrl: process.env.ROLLUP_API_URL,
      uploadToken: process.env.ROLLUP_UPLOAD_TOKEN,
      gitService: "github",
      debug: true,
      uploadOverrides: {
        sha: process.env.HEAD_SHA,
        compareSha: process.env.BASE_SHA,
      },
    }),
  ],
});
