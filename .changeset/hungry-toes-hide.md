---
"@codecov/bundler-plugin-core": patch
"@codecov/webpack-plugin": patch
"@codecov/rollup-plugin": patch
"@codecov/vite-plugin": patch
---

Refactor bundler-plugin-core to be a set of utility/helper functions, and refactor subsequent plugins to use these functions. This will make the plugins composable and easier to maintain in the future.
