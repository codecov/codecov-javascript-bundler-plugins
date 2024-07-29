// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import solidPlugin from "vite-plugin-solid";
import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";
var app_config_default = defineConfig({
  vite: {
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          format: "esm",
        },
      },
    },
    plugins: [
      solidPlugin(),
      codecovSolidStartPlugin({
        enableBundleAnalysis: true,
        bundleName: "",
        uploadToken: "test-token",
        apiUrl: process.env.API_URL,
      }),
    ],
  },
});
export { app_config_default as default };
