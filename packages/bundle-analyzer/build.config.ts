import { defineBuildConfig } from "unbuild";
import { codecovRollupPlugin } from "codecovProdRollupPlugin";
import packageJson from "./package.json";

// This file defines the Rollup configuration used by "unbuild" to bundle
// the bundle-analyzer package
export default defineBuildConfig({
  // We build with 2 entrypoints - one for the library and one for the CLI
  entries: ["./src/index.ts", "./src/cli.ts"],
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
        // We pull into environment variables the package version and name
        // which get written to the bundle stats report
        __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
        __PACKAGE_NAME__: JSON.stringify(packageJson.name),
      },
    },
  },
  hooks: {
    "rollup:options": (_ctx, opts) => {
      if (process.env.PLUGIN_CODECOV_TOKEN && Array.isArray(opts.plugins)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises
        opts.plugins = [
          // @ts-expect-error - using rollup plugin
          ...opts.plugins,
          // We analyze this bundle-analyzer package's build
          // using the codecov rollup plugin
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
