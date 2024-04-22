import { codecovNuxtPlugin } from "@codecov/nuxt-plugin";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    plugins: [
      codecovNuxtPlugin({
        dryRun: true,
        bundleName: "nuxt-bundle-analysis",
        enableBundleAnalysis: true,
      }),
    ],
  },
});
