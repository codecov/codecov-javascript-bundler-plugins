---
"@codecov/bundler-plugin-core": patch
"@codecov/sveltekit-plugin": patch
"@codecov/webpack-plugin": patch
"@codecov/rollup-plugin": patch
"@codecov/nuxt-plugin": patch
"@codecov/vite-plugin": patch
---

Add rollup as dev dep to vite plugin, and export ModuleFormat type being used in getBundleName functions for Nuxt and SvelteKit.
