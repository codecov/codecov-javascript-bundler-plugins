const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    codecovWebpackPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-webpack-staging",
      uploadToken: process.env.CODECOV_ORG_TOKEN_STAGING,
      apiUrl: process.env.CODECOV_STAGING_API_URL,
    }),
  ],
};
