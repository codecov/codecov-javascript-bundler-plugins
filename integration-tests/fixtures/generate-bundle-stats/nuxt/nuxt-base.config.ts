import { defineNuxtConfig } from "nuxt/config";

const config: ReturnType<typeof defineNuxtConfig> = defineNuxtConfig({
  buildDir: `distV3`,
  ssr: true,
  modules: [
    [
      "@codecov/nuxt-plugin",
      {
        enableBundleAnalysis: true,
        bundleName: "test-nuxt-v3",
        uploadToken: "test-token",
        apiUrl: process.env.API_URL,
        telemetry: false,
      },
    ],
  ],
  vite: {
    clearScreen: false,
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          format: "esm",
        },
      },
    },
  },
});

export default config;
