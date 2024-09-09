---
"@codecov/bundler-plugin-core": major
"@codecov/nextjs-webpack-plugin": major
"@codecov/nuxt-plugin": major
"@codecov/remix-vite-plugin": major
"@codecov/rollup-plugin": major
"@codecov/solidstart-plugin": major
"@codecov/sveltekit-plugin": major
"@codecov/vite-plugin": major
"@codecov/webpack-plugin": major
---

Release 1.0.0 of the plugins. You can read more about the plugins in our [docs](https://docs.codecov.com/docs/javascript-bundle-analysis).

The plugins currently support the following frameworks and meta-frameworks:

- Next.js
- Nuxt.js
- Remix (Vite)
- Rollup
- SolidStart
- SvelteKit
- Vite
- Webpack

The plugins have the following functionality:

- Automatically collect and upload bundle stats data to Codecov
- Tokenless uploads of bundle stats for forked upstream pull requests
- GH OIDC authentication for users or organizations who have configured it with GitHub
- Support for Codecov Enterprise and self hosted users
