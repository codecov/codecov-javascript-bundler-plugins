import { defineBuildConfig } from "unbuild";
import { codecovRollupPlugin } from "codecovProdRollupPlugin";

export default defineBuildConfig({
  entries: ["./src/index"],
  outDir: "dist",
  declaration: "compatible",
  sourcemap: true,
  externals: ["rollup"],
  rollup: {
    dts: {
      compilerOptions: {
        removeComments: false,
      },
    },
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
  hooks: {
    "rollup:options": (_ctx, opts) => {
      if (process.env.PLUGIN_CODECOV_TOKEN) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        opts.plugins = [
          opts.plugins,
          codecovRollupPlugin({
            enableBundleAnalysis:
              typeof process.env.PLUGIN_CODECOV_TOKEN === "string",
            bundleName: "@codecov/rollup-plugin",
            uploadToken: process.env.PLUGIN_CODECOV_TOKEN,
            apiUrl: process.env.PLUGIN_CODECOV_API_URL,
          }),
        ];
      }
    },
  },
});
