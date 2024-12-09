import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

/** @type {import('next').NextConfig} */
export default {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "test-nextjs-v14",
        uploadToken: "test-token",
        apiUrl: process.env.API_URL,
        webpack: options.webpack,
        telemetry: false,
        debug: true,
      }),
    );

    return config;
  },
};
