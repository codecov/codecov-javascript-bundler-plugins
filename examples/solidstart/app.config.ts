import { defineConfig } from "@solidjs/start/config";
import solidPlugin from "vite-plugin-solid";
import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";

export default defineConfig({
  vite: {
    plugins: [
      solidPlugin(),
      codecovSolidStartPlugin({
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-solidstart-app",
        uploadToken: process.env.SOLIDSTART_UPLOAD_TOKEN,
        apiUrl: process.env.SOLIDSTART_API_URL,
        gitService: "github",
        debug: true,
      }),
    ],
  },
});
