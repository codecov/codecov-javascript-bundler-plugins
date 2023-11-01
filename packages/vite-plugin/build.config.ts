import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index"],
  outDir: "dist",
  declaration: "compatible",
  sourcemap: true,
  externals: ["vite"],
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: true,
    },
  },
});
