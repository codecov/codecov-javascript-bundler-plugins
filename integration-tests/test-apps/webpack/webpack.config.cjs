const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].chunk.js",
  },
  plugins: [
    codecovWebpackPlugin({
      enableBundleAnalysis: true,
      dryRun: true,
    }),
  ],
};
