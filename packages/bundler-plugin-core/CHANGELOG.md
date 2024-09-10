# @codecov/bundler-plugin-core

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
- a2e576f: Fix SvelteKit plugin keywords
- 5ad4bfa: Update plugins to remove sourcemaps from bundle stats data
- da9b990: Preserve JSDoc comments during build process for the bundler plugins
- 94a46aa: Grab branch name inside Vercel helper so that we for sure have a branch value
- f0c0a79: Swap from using empty strings to null values for CI providers
- 33b335e: Normalize options to set default values as well as validate bundle names ensuring they follow the correct pattern.
- 834dd14: Update Vercel env helper function to create full git slug
- f5cae1c: Move packages into beta
- e6f3e66: Refactor bundler-plugin-core to be a set of utility/helper functions, and refactor subsequent plugins to use these functions. This will make the plugins composable and easier to maintain in the future.
- 9038f06: feat: send metrics to sentry
- f0fd4ce: Add codecov prefix to log messages
- ec6b13a: Remove requirement for uploadToken being present adding support for tokenless uploads.
- 297cd29: Add in support for bundle analysis for SvelteKit through new SvelteKit plugin
- cb90ab7: Add in a new plugin specifically for Nuxt
- 4e1516a: Modify output formats to be consistent across aliases and bundlers
- 7bc7183: Add more detailed logging for upload stats
- dfb26db: Adjust asset type to contain gzipSize, add new function to collect gzip values
- 297cd29: Update license to 2024
- 153f684: Add in debug option that will enable more in-depth logs
- a34fb57: Add in better debug logging around choosing the commit sha
- a2e576f: Add in new Remix Vite plugin
- c6dc57c: Remove Sentry stats upload from the plugins, as the project has been put on hold
- dfb26db: Set version from passed output arg, and collect gzip information in plugins
- fe21d8a: Update normalizePath function to handle [hash][extname] case.
- f290775: Fix jsdoc lint rule issue in solidstart plugin
- d74a176: When a user submits a invalid bundle name, we will hard fail and exit the bundle process now.
- 6c02b73: Fix normalizePath not handling all base64 characters and dashes
- b1967b1: Swap over to using @actions/github to grab head and base commit sha's in GHA
- dfb26db: Update meta-framework plugins to collect version generated in output arg

## 0.0.1-beta.12

### Patch Changes

- f0c0a79: Swap from using empty strings to null values for CI providers

## 0.0.1-beta.11

### Patch Changes

- dfb26db: Adjust asset type to contain gzipSize, add new function to collect gzip values
- dfb26db: Set version from passed output arg, and collect gzip information in plugins
- dfb26db: Update meta-framework plugins to collect version generated in output arg

## 0.0.1-beta.10

### Patch Changes

- a2e576f: Fix SvelteKit plugin keywords
- a2e576f: Add in new Remix Vite plugin

## 0.0.1-beta.9

### Patch Changes

- 297cd29: Add in support for bundle analysis for SvelteKit through new SvelteKit plugin
- 297cd29: Update license to 2024
- fe21d8a: Update normalizePath function to handle [hash][extname] case.
- d74a176: When a user submits a invalid bundle name, we will hard fail and exit the bundle process now.

## 0.0.1-beta.8

### Patch Changes

- a34fb57: Add in better debug logging around choosing the commit sha

## 0.0.1-beta.7

### Patch Changes

- e6f3e66: Refactor bundler-plugin-core to be a set of utility/helper functions, and refactor subsequent plugins to use these functions. This will make the plugins composable and easier to maintain in the future.
- cb90ab7: Add in a new plugin specifically for Nuxt

## 0.0.1-beta.6

### Patch Changes

- 153f684: Add in debug option that will enable more in-depth logs

## 0.0.1-beta.5

### Patch Changes

- 5ad4bfa: Update plugins to remove sourcemaps from bundle stats data
- 4e1516a: Modify output formats to be consistent across aliases and bundlers
- c6dc57c: Remove Sentry stats upload from the plugins, as the project has been put on hold
- 6c02b73: Fix normalizePath not handling all base64 characters and dashes

## 0.0.1-beta.4

### Patch Changes

- 9038f06: feat: send metrics to sentry

## 0.0.1-beta.3

### Patch Changes

- da9b990: Preserve JSDoc comments during build process for the bundler plugins
- 33b335e: Normalize options to set default values as well as validate bundle names ensuring they follow the correct pattern.

## 0.0.1-beta.2

### Patch Changes

- 94a46aa: Grab branch name inside Vercel helper so that we for sure have a branch value
- 7bc7183: Add more detailed logging for upload stats

## 0.0.1-beta.1

### Patch Changes

- 834dd14: Update Vercel env helper function to create full git slug
- f0fd4ce: Add codecov prefix to log messages

## 0.0.1-beta.0

### Patch Changes

- f5cae1c: Move packages into beta
- becd728: Add duration to webpack bundler plugin directly
- 543a526: Update dependencies before moving package out of alpha
- 4f1183e: Remove references to Webpack 4, as we currently on support Node 18+.
- c1fdbd6: Fix retry when fetching by throwing custom error if response is not okay
- d28a2e4: Break from retry loop when the response is ok
- 7c55993: Rename uploaderOverrides to uploadOverrides, remove url from uploadOverrides, and removal of repoToken/globalUploadToken in favour of just uploadToken.
- 36ed299: Alpha release of Codecov bundler plugins
- 562ac0c: Adjust peer dep versions to use x-range instead of caret
- 48b6e90: Move bundler-core test deps to dev deps
- c755a5c: Add missing outputPath to output stats file

## 0.0.1-alpha.3

### Patch Changes

- 543a526: Update dependencies before moving package out of alpha
- c1fdbd6: Fix retry when fetching by throwing custom error if response is not okay
- d28a2e4: Break from retry loop when the response is ok
- 562ac0c: Adjust peer dep versions to use x-range instead of caret
- c755a5c: Add missing outputPath to output stats file

## 0.0.1-alpha.2

### Patch Changes

- becd728: Add duration to webpack bundler plugin directly
- 7c55993: Rename uploaderOverrides to uploadOverrides, remove url from uploadOverrides, and removal of repoToken/globalUploadToken in favour of just uploadToken.

## 0.0.1-alpha.1

### Patch Changes

- 4f1183e: Remove references to Webpack 4, as we currently on support Node 18+.
- 48b6e90: Move bundler-core test deps to dev deps

## 0.0.1-alpha.0

### Patch Changes

- 36ed299: Alpha release of Codecov bundler plugins
