import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index", "./src/bin/index"],
  outDir: "dist",
  declaration: "compatible",
  sourcemap: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
});
