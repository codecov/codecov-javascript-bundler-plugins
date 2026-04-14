import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  // build: {
  //   rollupOptions: {
  //     output: {
  //       assetFileNames: "[name].[hash].js",
  //       chunkFileNames: "[name]-[hash].js",
  //     },
  //   },
  // },
  plugins: [
    react(),
    codecovVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "@codecov/example-vite-app",
      uploadToken: process.env.VITE_UPLOAD_TOKEN,
      apiUrl: process.env.VITE_API_URL,
      debug: true,
      assetFileNames: "[name].[hash].js",
      chunkFileNames: "[name]-[hash].js",
    }),
  ],
});
