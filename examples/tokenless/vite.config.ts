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
      bundleName: "@codecov/example-tokenless-app",
      uploadToken: process.env.TOKENLESS_UPLOAD_TOKEN,
      apiUrl: process.env.TOKENLESS_API_URL,
      gitService: "github",
      debug: true,
    }),
  ],
});
