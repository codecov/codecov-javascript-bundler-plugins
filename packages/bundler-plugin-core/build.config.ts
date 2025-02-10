import { defineBuildConfig } from "unbuild";
import { codecovRollupPlugin } from "codecovProdRollupPlugin";
import packageJson from "./package.json";

export default defineBuildConfig({
  entries: ["./src/index"],
  outDir: "dist",
  declaration: "compatible",
  rollup: {
    dts: {
      compilerOptions: {
        removeComments: false,
      },
    },
    emitCJS: true,
  },
  hooks: {
    "rollup:options": (ctx, opts) => {
      // We want to ensure that `@sentry/core` is not externalized
      // So we do not ship this dependency to users, as this may lead to conflicts with their installed Sentry versions
      // TODO: When unbuild is updated to 3.3.0, this can be simplified by configuring `inlineDependencies`
      // See: https://github.com/unjs/unbuild/releases/tag/v3.3.0
      // Inspired by https://github.com/nuxt/nuxt/blob/f0ce20388d2ab533eba016de0565c150ea3c5172/packages/schema/build.config.ts#L23-L34
      ctx.options.rollup.dts.respectExternal = false;
      const isExternal = opts.external as (
        id: string,
        importer?: string,
        isResolved?: boolean,
      ) => boolean;
      opts.external = (source, importer, isResolved) => {
        if (source === "@sentry/core") {
          return false;
        }
        return isExternal(source, importer, isResolved);
      };

      if (process.env.PLUGIN_CODECOV_TOKEN && Array.isArray(opts.plugins)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises
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
