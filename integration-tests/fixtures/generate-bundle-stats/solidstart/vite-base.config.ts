import solid from "solid-start/vite";

import { defineConfig } from "vite";
import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";

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
    solid(),
    codecovSolidStartPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-solidstart-v2",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
