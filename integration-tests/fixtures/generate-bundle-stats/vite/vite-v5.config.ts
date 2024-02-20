import { codecovVitePlugin } from "@codecov/vite-plugin";
import path from "path";
import { defineConfig } from "viteV5";

const vitePath = path.resolve(__dirname, "../../../test-apps/vite");

export default defineConfig({
  clearScreen: false,
  root: vitePath,
  build: {
    outDir: "distV5",
    rollupOptions: {
      input: `${vitePath}/index.html`,
      output: {
        format: "esm",
      },
    },
  },
  plugins: [
    codecovVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "test-vite-v5",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
