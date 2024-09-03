// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    [
      "@codecov/nuxt-plugin",
      {
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-nuxt-app",
        uploadToken: process.env.NUXT_UPLOAD_TOKEN,
        apiUrl: process.env.NUXT_API_URL,
        gitService: "github",
        debug: true,
      },
    ],
  ],
});
