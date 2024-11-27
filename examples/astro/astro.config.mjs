// @ts-check
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
  integrations: [
    react(),
    codecovAstroIntegration({
      enableBundleAnalysis: true,
      bundleName: "@codecov/example-astro-app",
      uploadToken: process.env.ASTRO_UPLOAD_TOKEN,
      apiUrl: process.env.ASTRO_API_URL,
      gitService: "github",
      debug: true,
    }),
  ],
});
