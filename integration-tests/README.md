<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Integration Tests

Each directory in the fixtures directory represents one testing scenario, with a corresponding test file for each bundler we currently support.
When `pnpm run test:e2e` is ran, we run jest, which will pick up all \*.test.ts files.

In the `test-api` directory is a simple API that we use to create more realistic testing scenarios for each bundler.

In the `test-apps` directory are a set of apps that we use to test the integration with each bundler.
