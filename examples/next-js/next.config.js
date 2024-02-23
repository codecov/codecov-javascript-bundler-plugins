const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.plugins.push(
      codecovWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-next-app",
        uploadToken: process.env.NEXT_UPLOAD_TOKEN,
        apiUrl: process.env.NEXT_API_URL,
      }),
    );

    return config;
  },
};

module.exports = nextConfig;
