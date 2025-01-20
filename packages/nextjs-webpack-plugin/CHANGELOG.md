# @codecov/nextjs-webpack-plugin

## 1.8.0

### Minor Changes

- 01de9e5: Add Sentry to the bundler plugins to start collecting issues and telemetry

### Patch Changes

- 01de9e5: Fix issue not using the correct webpack in the nextjs plugin
- Updated dependencies [01de9e5]
- Updated dependencies [01de9e5]
  - @codecov/bundler-plugin-core@1.8.0
  - @codecov/webpack-plugin@1.8.0

## 1.7.0

### Minor Changes

- d2e73a6: Add in support for Vite V6, Astro V5, and update related dependencies

### Patch Changes

- Updated dependencies [d2e73a6]
  - @codecov/bundler-plugin-core@1.7.0
  - @codecov/webpack-plugin@1.7.0

## 1.6.0

### Minor Changes

- 90901a5: Export bundle analysis plugin return type from bundler plugin core
- 90901a5: Add new Astro Plugin to support BA uploads for Astro applications
- 6f2bebc: Collect dynamic imports for base bundler plugins, which apply to the extended meta-framework plugins.

### Patch Changes

- be672d0: Resolve issue with Local provider conditional check not being able to detect local values
- Updated dependencies [be672d0]
- Updated dependencies [90901a5]
- Updated dependencies [90901a5]
- Updated dependencies [6f2bebc]
  - @codecov/bundler-plugin-core@1.6.0
  - @codecov/webpack-plugin@1.6.0

## 1.5.1

### Patch Changes

- 072682c: Bump codecov plugin version for uploading stats
- Updated dependencies [072682c]
  - @codecov/bundler-plugin-core@1.5.1
  - @codecov/webpack-plugin@1.5.1

## 1.5.0

### Minor Changes

- 0efd87f: Update nuxt and related dependencies

### Patch Changes

- 9968698: Fix issue with bundle names not being reset in nextjs, rollup, vite, and webpack plugins.
- 8f89fd4: Remove unused regex character escape from normalizePath
- Updated dependencies [9968698]
- Updated dependencies [8f89fd4]
- Updated dependencies [0efd87f]
  - @codecov/bundler-plugin-core@1.5.0
  - @codecov/webpack-plugin@1.5.0

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
  - @codecov/webpack-plugin@1.4.0

## 1.3.0

### Minor Changes

- 168610b: Add in debug logs for each param for each provider for better debugging.
- 590f0f1: Add GITHUB_JOB env var to list of env var names in GitHubActions provider util

### Patch Changes

- Updated dependencies [168610b]
- Updated dependencies [590f0f1]
  - @codecov/bundler-plugin-core@1.3.0
  - @codecov/webpack-plugin@1.3.0

## 1.2.1

### Patch Changes

- 0ea4d42: Fix issue with normalizing paths with a custom hash length is set
- Updated dependencies [0ea4d42]
  - @codecov/bundler-plugin-core@1.2.1
  - @codecov/webpack-plugin@1.2.1

## 1.2.0

### Minor Changes

- 6c4377d: Add in better debug logging when fetching pre-signed url or uploading stats fail. Update current logs to have more details present.

### Patch Changes

- Updated dependencies [6c4377d]
  - @codecov/bundler-plugin-core@1.2.0
  - @codecov/webpack-plugin@1.2.0

## 1.1.0

### Minor Changes

- 875be0b: Add support for setups without a standard bundler through new Bundle Analyzer library and CLI

### Patch Changes

- Updated dependencies [875be0b]
  - @codecov/bundler-plugin-core@1.1.0
  - @codecov/webpack-plugin@1.1.0

## 1.0.1

### Patch Changes

- 3bf96e4: Switch webpack import from top level to dynamic in the webpack base plugin
- Updated dependencies [3bf96e4]
  - @codecov/webpack-plugin@1.0.1
  - @codecov/bundler-plugin-core@1.0.1

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
- ec6b13a: Remove requirement for uploadToken being present adding support for tokenless uploads.
- f290775: Add in new package for nextjs webpack
- 80dc4ee: Add the ability for users to use GH OIDC instead of explicit upload tokens
- f290775: Add in new extendable types from the plugin core so that we can further customize them in the plugins

### Patch Changes

- f290775: Fix jsdoc lint rule issue in solidstart plugin
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
  - @codecov/webpack-plugin@1.0.0
  - @codecov/bundler-plugin-core@1.0.0
