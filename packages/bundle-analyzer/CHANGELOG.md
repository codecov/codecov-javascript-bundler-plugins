# @codecov/bundle-analyzer

## 1.7.0

### Minor Changes

- d2e73a6: Add in support for Vite V6, Astro V5, and update related dependencies

### Patch Changes

- Updated dependencies [d2e73a6]
  - @codecov/bundler-plugin-core@1.7.0

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

## 1.5.1

### Patch Changes

- 072682c: Bump codecov plugin version for uploading stats
- Updated dependencies [072682c]
  - @codecov/bundler-plugin-core@1.5.1

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

## 1.3.0

### Minor Changes

- 168610b: Add in debug logs for each param for each provider for better debugging.
- 590f0f1: Add GITHUB_JOB env var to list of env var names in GitHubActions provider util

### Patch Changes

- Updated dependencies [168610b]
- Updated dependencies [590f0f1]
  - @codecov/bundler-plugin-core@1.3.0

## 1.2.1

### Patch Changes

- 0ea4d42: Fix issue with normalizing paths with a custom hash length is set
- Updated dependencies [0ea4d42]
  - @codecov/bundler-plugin-core@1.2.1

## 1.2.0

### Minor Changes

- 6c4377d: Add in better debug logging when fetching pre-signed url or uploading stats fail. Update current logs to have more details present.

### Patch Changes

- Updated dependencies [6c4377d]
  - @codecov/bundler-plugin-core@1.2.0

## 1.1.0

### Minor Changes

- 875be0b: Add support for setups without a standard bundler through new Bundle Analyzer library and CLI

### Patch Changes

- Updated dependencies [875be0b]
  - @codecov/bundler-plugin-core@1.1.0
