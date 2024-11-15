import { defineBuildConfig } from "unbuild";
import { codecovRollupPlugin } from "codecovProdRollupPlugin";
import packageJson from "./package.json";

export default defineBuildConfig({
  entries: ["./src/index"],
  outDir: "dist",
  declaration: "compatible",
  sourcemap: true,
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
      if (process.env.PLUGIN_CODECOV_TOKEN && Array.isArray(opts.plugins)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call @ts-expect-error - using rollup plugin
        opts.plugins = [
          // @ts-expect-error - using rollup plugin
          ...opts.plugins,
          // @ts-expect-error - using rollup plugin
          codecovRollupPlugin({
            enableBundleAnalysis:
              typeof process.env.PLUGIN_CODECOV_TOKEN === "string",
            bundleName: packageJson.name,
            uploadToken: process.env.PLUGIN_CODECOV_TOKEN,
            apiUrl: process.env.PLUGIN_CODECOV_API_URL,
          }),
        ];
      }
    },
  },
});
