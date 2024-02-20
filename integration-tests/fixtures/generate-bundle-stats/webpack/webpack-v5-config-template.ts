export const configV5 = ({
  id,
  status,
}: {
  id: number;
  status: number;
}) => `const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

const webpackPath = path.resolve(__dirname, "../../../test-apps/webpack");

module.exports = {
  cache: false,
  entry: \`\${webpackPath}/src/main.js\`,
  output: {
    path: \`\${webpackPath}/dist\`,
    filename: "main-[contenthash].js",
  },
  mode: "production",
  plugins: [
    codecovWebpackPlugin({
      enableBundleAnalysis: true,
      bundleName: "webpack-test",
      uploadToken: "test-token",
      apiUrl: "http://localhost:8000/test-url/${id}/${status}/false",
    }),
  ],
};`;
