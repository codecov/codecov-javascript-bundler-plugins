import * as esbuild from "esbuild";

const res = await esbuild.build({
  entryPoints: ["app.jsx"],
  bundle: true,
  outdir: "dist",
  // metafile: true,
  plugins: [
    {
      name: "esbuild-plugin-codecov",
      setup(build) {
        const options = build.initialOptions;
        options.metafile = true;
        console.log(build);
      },
    },
  ],
});

console.log(res.metafile);
