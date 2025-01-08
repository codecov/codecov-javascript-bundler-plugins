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
    //@ts-expect-error handle conflicting vite version types
    sveltekit(),
    //@ts-expect-error handle conflicting vite version types
    codecovSvelteKitPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-sveltekit-v2",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
      telemetry: false,
    }),
  ],
});
