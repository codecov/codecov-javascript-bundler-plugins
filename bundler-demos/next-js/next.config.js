const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.plugins.push(codecovWebpackPlugin({ enableBundleAnalysis: true }));

    return config;
  },
};

module.exports = nextConfig;
