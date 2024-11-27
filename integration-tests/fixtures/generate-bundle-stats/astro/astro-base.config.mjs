import { defineConfig } from "astro/config";

import codecovAstroIntegration from "@codecov/astro-integration";

import node from "@astrojs/node";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
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
    codecovAstroIntegration({
      enableBundleAnalysis: true,
      bundleName: "test-astro-v4",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
