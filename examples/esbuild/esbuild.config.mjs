import * as esbuild from "esbuild";
import { codecovEsbuildPlugin } from "@codecov/esbuild-plugin";

const plugin = codecovEsbuildPlugin({
  bundleName: "esbuild",
});

console.log(plugin);

const res = await esbuild.build({
  entryPoints: ["app.jsx"],
  bundle: true,
  outdir: "dist",
  plugins: [
    // plugin,
    {
      name: "test",
      setup(build) {
        console.log(plugin.setup(build));
      },
    },
  ],
});

// const metaFile = res.metafile;

console.log(res);
