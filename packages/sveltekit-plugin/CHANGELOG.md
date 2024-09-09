# @codecov/sveltekit-plugin

## 1.0.0

### Major Changes

- 4de6bf4: Release 1.0.0 of the plugins

### Minor Changes

- be89828: Update nuxt and related dependencies
- f290775: Add in new package for nextjs webpack
- 80dc4ee: Add the ability for users to use GH OIDC instead of explicit upload tokens
- f290775: Add in new extendable types from the plugin core so that we can further customize them in the plugins

### Patch Changes

- 4c6e863: Refactor webpack plugin to export utility functions that will be used in the upcoming NextJS plugin
- a2e576f: Fix SvelteKit plugin keywords
- f0c0a79: Swap from using empty strings to null values for CI providers
- ec6b13a: Remove requirement for uploadToken being present adding support for tokenless uploads.
- 297cd29: Add in support for bundle analysis for SvelteKit through new SvelteKit plugin
- dfb26db: Adjust asset type to contain gzipSize, add new function to collect gzip values
- 297cd29: Update license to 2024
- a2e576f: Add in new Remix Vite plugin
- dfb26db: Set version from passed output arg, and collect gzip information in plugins
- fe21d8a: Update normalizePath function to handle [hash][extname] case.
- f290775: Fix jsdoc lint rule issue in solidstart plugin
- d74a176: When a user submits a invalid bundle name, we will hard fail and exit the bundle process now.
- b1967b1: Swap over to using @actions/github to grab head and base commit sha's in GHA
- dfb26db: Update meta-framework plugins to collect version generated in output arg
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
- Updated dependencies [4de6bf4]
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
- Updated dependencies [f0c0a79]
  - @codecov/bundler-plugin-core@0.0.1-beta.12
  - @codecov/vite-plugin@0.0.1-beta.12

## 0.0.1-beta.11

### Patch Changes

- dfb26db: Adjust asset type to contain gzipSize, add new function to collect gzip values
- dfb26db: Set version from passed output arg, and collect gzip information in plugins
- dfb26db: Update meta-framework plugins to collect version generated in output arg
- Updated dependencies [dfb26db]
- Updated dependencies [dfb26db]
- Updated dependencies [dfb26db]
  - @codecov/bundler-plugin-core@0.0.1-beta.11
  - @codecov/vite-plugin@0.0.1-beta.11

## 0.0.1-beta.10

### Patch Changes

- a2e576f: Fix SvelteKit plugin keywords
- a2e576f: Add in new Remix Vite plugin
- Updated dependencies [a2e576f]
- Updated dependencies [a2e576f]
  - @codecov/bundler-plugin-core@0.0.1-beta.10
  - @codecov/vite-plugin@0.0.1-beta.10

## 0.0.1-beta.9

### Patch Changes

- 297cd29: Add in support for bundle analysis for SvelteKit through new SvelteKit plugin
- 297cd29: Update license to 2024
- fe21d8a: Update normalizePath function to handle [hash][extname] case.
- d74a176: When a user submits a invalid bundle name, we will hard fail and exit the bundle process now.
- Updated dependencies [297cd29]
- Updated dependencies [297cd29]
- Updated dependencies [fe21d8a]
- Updated dependencies [d74a176]
  - @codecov/bundler-plugin-core@0.0.1-beta.9
  - @codecov/vite-plugin@0.0.1-beta.9
