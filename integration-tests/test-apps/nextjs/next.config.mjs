import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

/** @type {import('next').NextConfig} */
export default {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "",
        uploadToken: "test-token",
        apiUrl: process.env.API_URL,
        webpack: options.webpack,
        debug: true,
      }),
    );

    return config;
  },
};
