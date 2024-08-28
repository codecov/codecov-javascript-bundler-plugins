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
      bundleName: "@codecov/example-oidc-app",
      apiUrl: process.env.OIDC_API_URL,
      gitService: "github",
      oidc: {
        useGitHubOIDC: true,
      },
      debug: true,
    }),
  ],
});
