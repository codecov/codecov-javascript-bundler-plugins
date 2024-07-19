import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { codecovSvelteKitPlugin } from "@codecov/sveltekit-plugin";

export default defineConfig({
  plugins: [
    sveltekit(),
    codecovSvelteKitPlugin({
      enableBundleAnalysis: true,
      bundleName: "@codecov/example-sveltekit-app",
      uploadToken: process.env.SVELTEKIT_UPLOAD_TOKEN,
      apiUrl: process.env.SVELTEKIT_API_URL,
      debug: true,
    }),
  ],
});
