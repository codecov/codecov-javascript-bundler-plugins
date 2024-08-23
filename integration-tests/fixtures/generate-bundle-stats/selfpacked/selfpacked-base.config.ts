import { codecovSelfpackedPlugin } from "@codecov/selfpacked-plugin";
import path from "path";
import { defineConfig } from "viteV5";

const selfpackedPath = path.resolve(__dirname, "../../../test-apps/selfpacked");

export default defineConfig({
  clearScreen: false,
  root: selfpackedPath,
  build: {
    sourcemap: false,
    outDir: "distV0",
    rollupOptions: {
      input: `${selfpackedPath}/index.html`,
      output: {
        format: "esm",
      },
    },
  },
  plugins: [
    codecovSelfpackedPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-vite-v5",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
