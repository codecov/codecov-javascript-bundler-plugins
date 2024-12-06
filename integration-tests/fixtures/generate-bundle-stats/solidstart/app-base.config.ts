import {
  type SolidStartInlineConfig,
  defineConfig,
} from "@solidjs/start/config";
import solidPlugin from "vite-plugin-solid";
import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";

export default defineConfig({
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
        bundleName: "test-solidstart-v1",
        uploadToken: "test-token",
        apiUrl: process.env.API_URL,
        telemetry: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    ],
  },
}) as SolidStartInlineConfig;
