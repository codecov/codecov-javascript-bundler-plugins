// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import node from "@astrojs/node";

import codecovAstroPlugin from "@codecov/astro-plugin";
// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    react(),
    codecovAstroPlugin({
      enableBundleAnalysis: true,
      bundleName: "@codecov/example-astro-5-app",
      uploadToken: process.env.ASTRO_5_UPLOAD_TOKEN,
      apiUrl: process.env.ASTRO_5_API_URL,
      gitService: "github",
      debug: true,
    }),
  ],
});
