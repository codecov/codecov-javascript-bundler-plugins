import { defineConfig } from "vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";

export default defineConfig({
  plugins: [
    codecovVitePlugin({
      enableBundleAnalysis: true,
      dryRun: true,
    }),
  ],
});
