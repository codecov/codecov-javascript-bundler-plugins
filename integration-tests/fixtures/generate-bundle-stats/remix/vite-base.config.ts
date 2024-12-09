import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "viteV5";
// @ts-expect-error this will be installed when copied to the test app
import tsconfigPaths from "vite-tsconfig-paths";
import { codecovRemixVitePlugin } from "@codecov/remix-vite-plugin";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    codecovRemixVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "test-remix-v2",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
      telemetry: false,
    }),
  ],
});
