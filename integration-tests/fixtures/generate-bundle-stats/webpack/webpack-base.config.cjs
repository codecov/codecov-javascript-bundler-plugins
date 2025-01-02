const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

const webpackPath = path.resolve(__dirname, "../../../test-apps/webpack");

module.exports = {
  cache: false,
  entry: `${webpackPath}/src/main.js`,
  output: {
    path: `${webpackPath}/distV5`,
    filename: "main-[contenthash].js",
    chunkFormat: "commonjs",
  },
  mode: "production",
  devtool: false,
  plugins: [
    codecovWebpackPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-webpack-v5",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
      telemetry: false,
    }),
  ],
};
