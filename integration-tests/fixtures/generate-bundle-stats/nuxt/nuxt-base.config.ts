import { codecovNuxtPlugin } from "@codecov/nuxt-plugin";
import { defineNuxtConfig } from "nuxt/config";

// const nuxtPath = path.resolve(__dirname, "../../../test-apps/nuxt");

const config: ReturnType<typeof defineNuxtConfig> = defineNuxtConfig({
  buildDir: `distV3`,
  // rootDir: nuxtPath,
  ssr: true,
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
    plugins: [
      codecovNuxtPlugin({
        enableBundleAnalysis: true,
        bundleName: "test-nuxt-v3",
        uploadToken: "test-token",
        apiUrl: process.env.API_URL,
      }),
    ],
  },
});

export default config;
