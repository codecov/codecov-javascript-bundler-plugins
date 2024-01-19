import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "[name].[hash].js",
        chunkFileNames: "[name]-[hash].js",
      },
    },
  },
  plugins: [
    react(),
    codecovVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "example-vite-staging",
      uploadToken: process.env.CODECOV_ORG_TOKEN_STAGING,
      apiUrl: process.env.CODECOV_STAGING_API_URL,
    }),
  ],
});
