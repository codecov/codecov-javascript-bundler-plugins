import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "viteV5";
import tsconfigPaths from "vite-tsconfig-paths";
import { codecovRemixPlugin } from "@codecov/remix-plugin";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    codecovRemixPlugin({
      enableBundleAnalysis: true,
      bundleName: "test-remix-v2",
      uploadToken: "test-token",
      apiUrl: process.env.API_URL,
    }),
  ],
});
