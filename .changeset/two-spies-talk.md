---
"@codecov/bundler-plugin-core": patch
"@codecov/sveltekit-plugin": patch
"@codecov/webpack-plugin": patch
"@codecov/rollup-plugin": patch
"@codecov/nuxt-plugin": patch
"@codecov/vite-plugin": patch
---

When a user submits a invalid bundle name, we will hard fail and exit the bundle process now.
