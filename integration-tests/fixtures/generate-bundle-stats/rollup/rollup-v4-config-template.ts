export const configV4 = ({
  id,
  status,
}: {
  id: number;
  status: number;
}) => `const path = require("path");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { codecovRollupPlugin } = require("@codecov/rollup-plugin");
const { defineConfig } = require("rollupV4");

const rollupPath = path.resolve(__dirname, "../../../test-apps/rollup");

module.exports = defineConfig({
  input: \`\${rollupPath}/src/main.js\`,
  output: {
    dir: \`\${rollupPath}/distV4\`,
    format: "iife",
    entryFileNames: "[name]-[hash].js",
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-rollup-v4",
      uploadToken: "test-token",
      apiUrl: "http://localhost:8000/test-url/${id}/${status}/false",
    }),
  ],
});`;
