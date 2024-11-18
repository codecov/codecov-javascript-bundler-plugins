# @codecov/solidstart-plugin

## 1.4.1

### Patch Changes

- 9968698: Fix issue with bundle names not being reset in nextjs, rollup, vite, and webpack plugins.
- Updated dependencies [9968698]
  - @codecov/bundler-plugin-core@1.4.1
  - @codecov/vite-plugin@1.4.1

## 1.4.0

### Minor Changes

- 2db57cc: Remove the org branch requirement for tokenless uploads
- b17f870: Bump vite versions

### Patch Changes

- ab1385e: Bump rollup versions
- 6552110: Bump nextjs versions
- Updated dependencies [2db57cc]
- Updated dependencies [ab1385e]
- Updated dependencies [b17f870]
- Updated dependencies [6552110]
  - @codecov/bundler-plugin-core@1.4.0
  - @codecov/vite-plugin@1.4.0

## 1.3.0

### Minor Changes

- 168610b: Add in debug logs for each param for each provider for better debugging.
- 590f0f1: Add GITHUB_JOB env var to list of env var names in GitHubActions provider util

### Patch Changes

- Updated dependencies [168610b]
- Updated dependencies [590f0f1]
  - @codecov/bundler-plugin-core@1.3.0
  - @codecov/vite-plugin@1.3.0

## 1.2.1

### Patch Changes

- 0ea4d42: Fix issue with normalizing paths with a custom hash length is set
- Updated dependencies [0ea4d42]
  - @codecov/bundler-plugin-core@1.2.1
  - @codecov/vite-plugin@1.2.1

## 1.2.0

### Minor Changes

- 6c4377d: Add in better debug logging when fetching pre-signed url or uploading stats fail. Update current logs to have more details present.

### Patch Changes

- Updated dependencies [6c4377d]
  - @codecov/bundler-plugin-core@1.2.0
  - @codecov/vite-plugin@1.2.0

## 1.1.0

### Minor Changes

- 875be0b: Add support for setups without a standard bundler through new Bundle Analyzer library and CLI

### Patch Changes

- Updated dependencies [875be0b]
  - @codecov/bundler-plugin-core@1.1.0
  - @codecov/vite-plugin@1.1.0

## 1.0.1

### Patch Changes

- 3bf96e4: Switch webpack import from top level to dynamic in the webpack base plugin
- Updated dependencies [3bf96e4]
  - @codecov/bundler-plugin-core@1.0.1
  - @codecov/vite-plugin@1.0.1

## 1.0.0

### Major Changes

- 4b311c0: Release 1.0.0 of the plugins. You can read more about the plugins and bundle analysis in our [docs](https://docs.codecov.com/docs/javascript-bundle-analysis).

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

### Minor Changes

- be89828: Update nuxt and related dependencies
- f290775: Add in new package for nextjs webpack
- 80dc4ee: Add the ability for users to use GH OIDC instead of explicit upload tokens
- f290775: Add in new extendable types from the plugin core so that we can further customize them in the plugins

### Patch Changes

- 4c6e863: Refactor webpack plugin to export utility functions that will be used in the upcoming NextJS plugin
- f0c0a79: Swap from using empty strings to null values for CI providers
- 22c99a7: Add support for SolidStart through new plugin
- ec6b13a: Remove requirement for uploadToken being present adding support for tokenless uploads.
- f290775: Fix jsdoc lint rule issue in solidstart plugin
- b1967b1: Swap over to using @actions/github to grab head and base commit sha's in GHA
- Updated dependencies [4c6e863]
- Updated dependencies [a2e576f]
- Updated dependencies [5ad4bfa]
- Updated dependencies [da9b990]
- Updated dependencies [94a46aa]
- Updated dependencies [f0c0a79]
- Updated dependencies [be89828]
- Updated dependencies [33b335e]
- Updated dependencies [834dd14]
- Updated dependencies [f5cae1c]
- Updated dependencies [e6f3e66]
- Updated dependencies [9038f06]
- Updated dependencies [f0fd4ce]
- Updated dependencies [ec6b13a]
- Updated dependencies [297cd29]
- Updated dependencies [cb90ab7]
- Updated dependencies [f290775]
- Updated dependencies [80dc4ee]
- Updated dependencies [4e1516a]
- Updated dependencies [7bc7183]
- Updated dependencies [f290775]
- Updated dependencies [dfb26db]
- Updated dependencies [297cd29]
- Updated dependencies [153f684]
- Updated dependencies [a34fb57]
- Updated dependencies [4b311c0]
- Updated dependencies [a2e576f]
- Updated dependencies [c6dc57c]
- Updated dependencies [dfb26db]
- Updated dependencies [fe21d8a]
- Updated dependencies [f290775]
- Updated dependencies [d74a176]
- Updated dependencies [6c02b73]
- Updated dependencies [b1967b1]
- Updated dependencies [dfb26db]
  - @codecov/bundler-plugin-core@1.0.0
  - @codecov/vite-plugin@1.0.0

## 0.0.1-beta.12

### Patch Changes

- f0c0a79: Swap from using empty strings to null values for CI providers
- 22c99a7: Add support for SolidStart through new plugin
- Updated dependencies [f0c0a79]
  - @codecov/bundler-plugin-core@0.0.1-beta.12
  - @codecov/vite-plugin@0.0.1-beta.12
