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
      bundleName: "@codecov/example-webpack-app",
      uploadToken: process.env.WEBPACK_UPLOAD_TOKEN,
      apiUrl: process.env.WEBPACK_API_URL,
      debug: true,
    }),
  ],
};
