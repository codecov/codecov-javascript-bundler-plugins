---
"@codecov/bundler-plugin-core": major
---

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
