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
      },
    ],
  ],
  vite: {
    clearScreen: false,
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          format: "systemjs",
        },
      },
    },
  },
});

export default config;
