# @codecov/astro-plugin

## 2.0.0

### Major Changes

- 1950efe: Version 2.0.0 addresses critical security issues and dependency updates. It also drops support for Node 18

  Bump `@actions/core` to ^3.0.0 and `@actions/github` to ^9.0.0, and set `engines.node` to `>=20.0.0` to match upstream. **Semver major** because supported Node.js drops below 20 (breaking for anyone still on Node 18).

  **@actions/core** ([actions/toolkit `packages/core/RELEASES.md`](https://github.com/actions/toolkit/blob/main/packages/core/RELEASES.md))

  - **v3.0.0**: ESM-only release; apps that `require("@actions/core")` directly must use dynamic `import()`. **`@codecov/bundler-plugin-core` bundles `@actions/core` and `@actions/github` into `dist/index.cjs`**, so `require("@codecov/bundler-plugin-core")` (e.g. Rollup/Webpack CJS configs) keeps working.
  - **v2.x** (between 1.x and 3.x): Node 24 support and `@actions/http-client` upgrades (including 3.x in the 2.x line).

  **@actions/github** ([actions/toolkit `packages/github/RELEASES.md`](https://github.com/actions/toolkit/blob/main/packages/github/RELEASES.md))

  - **v9.0.0**: ESM-only (same consideration as `@actions/core` for this package). Release notes also note improved TypeScript behavior with ESM and `@octokit/core/types`.
  - **v8.0.0**: **Minimum Node.js is now 20** (previously 18); Octokit dependencies move to current major lines (`@octokit/core`, REST plugins, request stack).
  - **v8.0.1**: Dependency updates (`undici`, `@actions/http-client`).

  **Impact here**

  - Runtime behavior we rely on is unchanged: `context` for GitHub Actions metadata and `getIDToken()` for OIDC uploads are still the supported APIs.
  - **Build**: unbuild inlines `@actions/*` (and their transitive deps) like `@sentry/core`; `failOnWarn: false` suppresses expected “inlined implicit external” noise. Published `dist` is larger (~9 MB CJS) but avoids `ERR_PACKAGE_PATH_NOT_EXPORTED` for CJS consumers.
  - **Node 18** is no longer a supported runtime for this package; use **Node 20+** (aligned with `@actions/github` 8+ and this repo’s Volta pin on Node 20).

### Patch Changes

- 866e31a: update GitHub Actions workflow permissions
- Updated dependencies [1950efe]
- Updated dependencies [866e31a]
  - @codecov/bundler-plugin-core@2.0.0
  - @codecov/vite-plugin@2.0.0

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
