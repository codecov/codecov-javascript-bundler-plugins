var __require = /* @__PURE__ */ ((x) =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
      ? new Proxy(x, {
          get: (a, b) => (typeof require !== "undefined" ? require : a)[b],
        })
      : x)(function (x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import solidPlugin from "vite-plugin-solid";
var { codecovSolidStartPlugin } = __require("@codecov/solidstart-plugin");
var app_config_default = defineConfig({
  vite: {
    plugins: [
      solidPlugin(),
      codecovSolidStartPlugin({
        enableBundleAnalysis: true,
        bundleName: "@codecov/example-solidstart-app",
        uploadToken: process.env.SOLIDSTART_UPLOAD_TOKEN,
        apiUrl: process.env.SOLIDSTART_API_URL,
        debug: true,
        dryRun: true,
      }),
    ],
  },
});
export { app_config_default as default };
