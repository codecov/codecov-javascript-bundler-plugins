import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { codecovRemixVitePlugin } from "@codecov/remix-vite-plugin";

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
    codecovRemixVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "@codecov/example-remix-app",
      uploadToken: process.env.REMIX_UPLOAD_TOKEN,
      apiUrl: process.env.REMIX_API_URL,
      debug: true,
    }),
  ],
});
