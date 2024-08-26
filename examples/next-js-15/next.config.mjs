import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-next-15-app",
        uploadToken: process.env.NEXT_UPLOAD_TOKEN,
        apiUrl: process.env.NEXT_API_URL,
        webpack: options.webpack,
        debug: true,
      }),
    );

    return config;
  },
};

export default nextConfig;
