# @codecov/bundler-plugin-core

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
