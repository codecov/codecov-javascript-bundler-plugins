# @codecov/astro-plugin

## 1.9.1

### Patch Changes

- 1db06c3: Bump vite version
- 8a6f939: Fix typo in event type matching, add merge group handling
- 4b36ee2: Update `next` to 14.2.25
- Updated dependencies [1db06c3]
- Updated dependencies [8a6f939]
- Updated dependencies [4b36ee2]
  - @codecov/vite-plugin@1.9.1
  - @codecov/bundler-plugin-core@1.9.1

## 1.9.0

### Minor Changes

- 392003d: Inline @sentry/core dependency
- 043b250: Update normalizePath to handle Vite legacy builds as they currently are not being normalized

### Patch Changes

- 06f90eb: Remove minification from plugin build
- 553176a: Dependency updates to the lockfile
- Updated dependencies [392003d]
- Updated dependencies [06f90eb]
- Updated dependencies [043b250]
- Updated dependencies [553176a]
  - @codecov/bundler-plugin-core@1.9.0
  - @codecov/vite-plugin@1.9.0

## 1.8.0

### Minor Changes

- 01de9e5: Add Sentry to the bundler plugins to start collecting issues and telemetry

### Patch Changes

- 01de9e5: Fix issue not using the correct webpack in the nextjs plugin
- Updated dependencies [01de9e5]
- Updated dependencies [01de9e5]
  - @codecov/bundler-plugin-core@1.8.0
  - @codecov/vite-plugin@1.8.0

## 1.7.0

### Minor Changes

- d2e73a6: Add in support for Vite V6, Astro V5, and update related dependencies

### Patch Changes

- Updated dependencies [d2e73a6]
  - @codecov/bundler-plugin-core@1.7.0
  - @codecov/vite-plugin@1.7.0

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
  - @codecov/vite-plugin@1.6.0
