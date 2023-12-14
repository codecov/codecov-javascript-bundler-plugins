const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.plugins.push(
      codecovWebpackPlugin({ enableBundleAnalysis: true, dryRun: true }),
    );

    return config;
  },
};

module.exports = nextConfig;
