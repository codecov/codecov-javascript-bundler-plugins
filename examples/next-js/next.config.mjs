import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

/** @type {import('next').NextConfig} */
export default {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-next-app",
        uploadToken: process.env.NEXT_UPLOAD_TOKEN,
        apiUrl: process.env.NEXT_API_URL,
        webpack: options.webpack,
        gitService: "github",
        debug: true,
      }),
    );

    return config;
  },
};
