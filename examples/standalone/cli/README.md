# Standalone Analyzer CLI Example

This directory includes an example calling the Codecov CLI for bundle analysis using the standalone-analyzer.

To run:

```
cd packages/standalone-analyzer
pnpm install
pnpm run build

cd examples/standalone/cli
pnpm install
pnpm run build
pnpm run analyze
```

This will call the CLI. Note a Codecov API server (e.g., that at `test-api`) needs to be running for any uploads (i.e., not dry-run) to succeed.

For example:

```
pnpm standalone-analyzer ./dist --bundle-name=test-cli --upload-token=abcd --dry-run
```

Generates a bundle stats report and prints to console:

```
{"version":"2","builtAt":1725365190149,"duration":7,"bundleName":"test-cli","plugin":{"name":"@codecov/standalone-analyzer","version":"0.0.1-beta.12"},"assets":[{"name":"main.js","size":511,"gzipSize":301,"normalized":"main.js"},{"name":"main.js.map","size":732,"gzipSize":null,"normalized":"main.js.map"}],"chunks":[],"modules":[]}
```
