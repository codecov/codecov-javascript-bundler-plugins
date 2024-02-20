const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

const webpackPath = path.resolve(__dirname, "../../../test-apps/webpack");

module.exports = {
  cache: false,
  entry: `${webpackPath}/src/main.js`,
  output: {
    path: `${webpackPath}/dist`,
    filename: "main-[contenthash].js",
  },
  mode: "production",
  plugins: [
    codecovWebpackPlugin({
      telemetry: false,
      enableBundleAnalysis: true,
      bundleName: "test-webpack-v5",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
};
