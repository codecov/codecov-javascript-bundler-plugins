import { sveltekit } from "@sveltejs/kit/vite";

import { codecovSvelteKitPlugin } from "@codecov/sveltekit-plugin";
import { defineConfig } from "viteV5";

export default defineConfig({
  clearScreen: false,
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
  plugins: [
    sveltekit(),
    codecovSvelteKitPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-sveltekit-v2",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
