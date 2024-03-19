const path = require("path");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { codecovRollupPlugin } = require("@codecov/rollup-plugin");
const { defineConfig } = require("rollupV3");

const rollupPath = path.resolve(__dirname, "../../../test-apps/rollup");

module.exports = defineConfig({
  input: `${rollupPath}/src/main.js`,
  output: {
    dir: `${rollupPath}/distV3`,
    format: "esm",
    entryFileNames: "[name]-[hash].js",
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-rollup-v3",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
