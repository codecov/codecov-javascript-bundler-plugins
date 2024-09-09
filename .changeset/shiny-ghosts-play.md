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

Release 1.0.0 of the plugins. You can read more about the plugins and bundle analysis in our [docs](https://docs.codecov.com/docs/javascript-bundle-analysis).

The plugins currently support the following frameworks and meta-frameworks:

- NextJS (Webpack) - [Docs](https://dash.readme.com/project/codecov/v2023/docs/nextjs-webpack-quick-start)
- Nuxt - [Docs](https://dash.readme.com/project/codecov/v2023/docs/nuxt-quick-start)
- Remix (Vite) - [Docs](https://dash.readme.com/project/codecov/v2023/docs/remix-vite-quick-start)
- Rollup - [Docs](https://dash.readme.com/project/codecov/v2023/docs/rollup-quick-start)
- SolidStart - [Docs](https://dash.readme.com/project/codecov/v2023/docs/sveltekit-quick-start)
- SvelteKit - [Docs](https://dash.readme.com/project/codecov/v2023/docs/solidstart-quick-start)
- Vite - [Docs](https://dash.readme.com/project/codecov/v2023/docs/vite-quick-start-vue-sveltekit-remix-solidjs-etc)
- Webpack - [Docs](https://dash.readme.com/project/codecov/v2023/docs/webpack-quick-start-nextjs-craco)

The plugins have the following functionality:

- Automatically collect and upload bundle stats data to Codecov
- Tokenless uploads of bundle stats for forked upstream pull requests - [Docs](https://dash.readme.com/project/codecov/v2023/docs/tokenless-bundle-analysis)
- GH OIDC authentication for users or organizations who have configured it with GitHub - [Docs](https://dash.readme.com/project/codecov/v2023/docs/github-oidc-bundle-analysis)
- Support for Codecov Enterprise and self hosted users
