import { codecovNuxtPlugin } from "@codecov/nuxt-plugin";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    plugins: [
      codecovNuxtPlugin({
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-nuxt-app",
        uploadToken: process.env.VITE_UPLOAD_TOKEN,
        apiUrl: process.env.VITE_API_URL,
      }),
    ],
  },
});
