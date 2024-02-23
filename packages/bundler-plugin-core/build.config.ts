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
    replace: {
      preventAssignment: true,
      values: {
        __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
      },
    },
  },
  hooks: {
    "rollup:options": (_ctx, opts) => {
      if (process.env.PLUGIN_CODECOV_TOKEN && Array.isArray(opts.plugins)) {
        opts.plugins = [
          ...opts.plugins,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          codecovRollupPlugin({
            enableBundleAnalysis:
              typeof process.env.PLUGIN_CODECOV_TOKEN === "string",
            bundleName: "@codecov/bundler-plugin-core",
            uploadToken: process.env.PLUGIN_CODECOV_TOKEN,
            apiUrl: process.env.PLUGIN_CODECOV_API_URL,
          }),
        ];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        opts.plugins = opts.plugins;
      }
    },
  },
});
