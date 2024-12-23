import { defineConfig } from "astro/config";

import codecovAstroPlugin from "@codecov/astro-plugin";

import node from "@astrojs/node";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    rollupOptions: {
      output: {
        format: "esm",
      }
    }
  },
  integrations: [
    react(),
    codecovAstroPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-astro-v4",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
