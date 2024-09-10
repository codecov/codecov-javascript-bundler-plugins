# Bundle Analyzer Library Import (CJS) Example

This directory includes an example calling the bundle-analyzer exported library for bundle analysis.

This example runs in a CJS environment.

To run:

```
# build the library
cd packages/bundle-analyzer
pnpm install
pnpm run build

# create an example build to analyze
cd examples/bundle-analyzer/cli
pnpm install
pnpm run build

# run the node program
cd examples/bundle-analyzer/library-import
pnpm install
pnpm run start
```

This will call the imported function that creates and uploads (or dry-runs) the bundle stats report.

For example:

```
pnpm run start
```

Generates a bundle stats report and prints to console:

```
Dry run output:  {"version":"2","builtAt":1725381817642,"duration":6,"bundleName":"my-bundle","plugin":{"name":"@codecov/bundle-analyzer","version":"0.0.1-beta.12"},"assets":[{"name":"main.js","size":511,"gzipSize":301,"normalized":"main.js"},{"name":"main.js.map","size":732,"gzipSize":null,"normalized":"main.js.map"}],"chunks":[],"modules":[]}
Report successfully generated and uploaded.
```