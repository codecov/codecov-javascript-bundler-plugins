import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { codecovSvelteKitPlugin } from "@codecov/sveltekit-plugin";

export default defineConfig({
  plugins: [
    sveltekit(),
    codecovSvelteKitPlugin({
      enableBundleAnalysis: true,
      uploadToken: "test-token",
      bundleName: "@codecov/example-sveltekit-app",
    }),
  ],
});
