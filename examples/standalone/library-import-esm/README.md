# Standalone Analyzer Library Import (ESM) Example

This directory includes an example calling the standalone-analyzer exported library for bundle analysis.

This example runs in an ESM environment.

To run:

```
# build the library
cd packages/standalone-analyzer
pnpm install
pnpm run build

# create an example build to analyze
cd examples/standalone/cli
pnpm install
pnpm run build

# run the node program
cd examples/standalone/library-import
pnpm install
pnpm run start
```

This will call the imported function. Note a Codecov API server (e.g., that at `test-api`) needs to be running for any uploads (i.e., not dry-run) to succeed.

For example:

```
pnpm run start
```

Generates a bundle stats report and prints to console:

```
Dry run output:  {"version":"2","builtAt":1725381817642,"duration":6,"bundleName":"my-bundle","plugin":{"name":"@codecov/standalone-analyzer","version":"0.0.1-beta.12"},"assets":[{"name":"main.js","size":511,"gzipSize":301,"normalized":"main.js"},{"name":"main.js.map","size":732,"gzipSize":null,"normalized":"main.js.map"}],"chunks":[],"modules":[]}
Report successfully generated and uploaded.
```
