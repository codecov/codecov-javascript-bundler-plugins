# @codecov/webpack-plugin

## 0.0.1-beta.7

### Patch Changes

- e6f3e66: Refactor bundler-plugin-core to be a set of utility/helper functions, and refactor subsequent plugins to use these functions. This will make the plugins composable and easier to maintain in the future.
- 6850830: Add in a new plugin specifically for Nuxt
- Updated dependencies [e6f3e66]
- Updated dependencies [6850830]
  - @codecov/bundler-plugin-core@0.0.1-beta.7

## 0.0.1-beta.6

### Patch Changes

- 153f684: Add in debug option that will enable more in-depth logs
- Updated dependencies [153f684]
  - @codecov/bundler-plugin-core@0.0.1-beta.6

## 0.0.1-beta.5

### Patch Changes

- 5ad4bfa: Update plugins to remove sourcemaps from bundle stats data
- 4e1516a: Modify output formats to be consistent across aliases and bundlers
- c6dc57c: Remove Sentry stats upload from the plugins, as the project has been put on hold
- 6c02b73: Fix normalizePath not handling all base64 characters and dashes
- Updated dependencies [5ad4bfa]
- Updated dependencies [4e1516a]
- Updated dependencies [c6dc57c]
- Updated dependencies [6c02b73]
  - @codecov/bundler-plugin-core@0.0.1-beta.5

## 0.0.1-beta.4

### Patch Changes

- 9038f06: feat: send metrics to sentry
- Updated dependencies [9038f06]
  - @codecov/bundler-plugin-core@0.0.1-beta.4

## 0.0.1-beta.3

### Patch Changes

- da9b990: Preserve JSDoc comments during build process for the bundler plugins
- 33b335e: Normalize options to set default values as well as validate bundle names ensuring they follow the correct pattern.
- Updated dependencies [da9b990]
- Updated dependencies [33b335e]
  - @codecov/bundler-plugin-core@0.0.1-beta.3

## 0.0.1-beta.2

### Patch Changes

- 94a46aa: Grab branch name inside Vercel helper so that we for sure have a branch value
- 7bc7183: Add more detailed logging for upload stats
- Updated dependencies [94a46aa]
- Updated dependencies [7bc7183]
  - @codecov/bundler-plugin-core@0.0.1-beta.2

## 0.0.1-beta.1

### Patch Changes

- 834dd14: Update Vercel env helper function to create full git slug
- f0fd4ce: Add codecov prefix to log messages
- Updated dependencies [834dd14]
- Updated dependencies [f0fd4ce]
  - @codecov/bundler-plugin-core@0.0.1-beta.1

## 0.0.1-beta.0

### Patch Changes

- f5cae1c: Move packages into beta
- Updated dependencies [f5cae1c]
  - @codecov/bundler-plugin-core@0.0.1-beta.0
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
- Updated dependencies [becd728]
- Updated dependencies [543a526]
- Updated dependencies [4f1183e]
- Updated dependencies [c1fdbd6]
- Updated dependencies [d28a2e4]
- Updated dependencies [7c55993]
- Updated dependencies [36ed299]
- Updated dependencies [562ac0c]
- Updated dependencies [48b6e90]
- Updated dependencies [c755a5c]
  - @codecov/bundler-plugin-core@0.0.1

## 0.0.1-alpha.3

### Patch Changes

- 543a526: Update dependencies before moving package out of alpha
- c1fdbd6: Fix retry when fetching by throwing custom error if response is not okay
- d28a2e4: Break from retry loop when the response is ok
- 562ac0c: Adjust peer dep versions to use x-range instead of caret
- c755a5c: Add missing outputPath to output stats file
- Updated dependencies [543a526]
- Updated dependencies [c1fdbd6]
- Updated dependencies [d28a2e4]
- Updated dependencies [562ac0c]
- Updated dependencies [c755a5c]
  - @codecov/bundler-plugin-core@0.0.1-alpha.3

## 0.0.1-alpha.2

### Patch Changes

- becd728: Add duration to webpack bundler plugin directly
- 7c55993: Rename uploaderOverrides to uploadOverrides, remove url from uploadOverrides, and removal of repoToken/globalUploadToken in favour of just uploadToken.
- Updated dependencies [becd728]
- Updated dependencies [7c55993]
  - @codecov/bundler-plugin-core@0.0.1-alpha.2

## 0.0.1-alpha.1

### Patch Changes

- 4f1183e: Remove references to Webpack 4, as we currently on support Node 18+.
- 48b6e90: Move bundler-core test deps to dev deps
- Updated dependencies [4f1183e]
- Updated dependencies [48b6e90]
  - @codecov/bundler-plugin-core@0.0.1-alpha.1

## 0.0.1-alpha.0

### Patch Changes

- 36ed299: Alpha release of Codecov bundler plugins
- Updated dependencies [36ed299]
  - @codecov/bundler-plugin-core@0.0.1-alpha.0
