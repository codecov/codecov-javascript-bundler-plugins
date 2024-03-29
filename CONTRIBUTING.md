<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Contributing

We welcome suggested improvements and bug fixes to the `@codecov/*` family of packages, in the form of pull requests on [`GitHub`](https://github.com/codecov/codecov-javascript-bundler-plugins). The guide below will help you get started, but if you have further questions, please feel free to reach out on [Sentry's Discord](https://discord.gg/Ww9hbqr).

Also, be sure to check out [Codecov's contributing guide](https://github.com/codecov/contributing/blob/main/CONTRIBUTING.md).

## Setting up an Environment

To run the test suite and our code linter, node.js and pnpm are required.

- [`node` download](https://nodejs.org/download)
- [`pnpm` download](https://pnpm.io/installation)

`codecov-javascript-bundler-plugins` is a monorepo containing several packages, and we use `pnpm` to manage them. To get started, install all dependencies and then perform an initial build.

```shell
pnpm install
pnpm run build
```

With that, the repo is fully set up and you are ready to run all commands.

## Building Packages

Since we are using [`TypeScript`](https://www.typescriptlang.org/), you need to transpile the code to JavaScript to be able to use it. From the top level of the repo, there are two commands available:

- `pnpm run build`, which runs a one-time build (transpiling and type generation) of every package
- `pnpm run dev`, which runs the command listed above in watch mode, meaning the command is re-executed after every file change

## Adding Tests

**Any nontrivial fixes/features should include tests.** You'll find tests are located in their nearest `__tests__` directory.

## Running Tests

Running tests works the same way as building - running `pnpm run test:unit` at the project root will run tests for all packages, and running `pnpm run test:unit` in a specific package will run tests for that package.

## Linting

Similar to building and testing, linting can be done in the project root or in individual packages by calling `pnpm run lint`.

## Considerations Before Sending Your First PR

When contributing to the codebase, please note:

- Non-trivial PRs will not be accepted without tests (see above).
  If you need assistance in writing tests, feel free to reach out to us.
- Please do not bump version numbers yourself.

## PR reviews

For feedback in PRs, we use the [LOGAF scale](https://blog.danlew.net/2020/04/15/the-logaf-scale/) to specify how important a comment is:

- `l`: low - nitpick. You may address this comment, but you don't have to.
- `m`: medium - normal comment. Worth addressing and fixing.
- `h`: high - Very important. We cannot merge this PR without addressing this issue.

You only need one approval from a maintainer to be able to merge. For some PRs, asking specific or multiple people for review might be adequate.

Our different types of reviews:

1. **LGTM without any comments.** You can merge immediately.
2. **LGTM with low and medium comments.** The reviewer trusts you to resolve these comments yourself, and you don't need to wait for another approval.
3. **Only comments.** You must address all the comments and need another review until you merge.
4. **Request changes.** Only use if something critical is in the PR that absolutely must be addressed. We usually use `h` comments for that. When someone requests changes, the same person must approve the changes to allow merging. Use this sparingly.

## Publishing a Release

We use the [changesets](https://github.com/changesets/changesets) CLI tool to manage our versions for the Codecov Bundler Plugins.

### Updating the Changelog

To add a new changelog for the plugins you can run the following command:

```shell
pnpm run changeset:add
```

This will prompt you to select the bundles that will have their version updated
when running the `prepare-publish` workflow. To keep the plugins all inline, you
will need to select all of the plugins, even if you only changed one.

After confirming your selections, you will have to determine what kind of change
your new release will be: `major`, `minor`, or `patch`. You can read more [here](https://semver.org/)
to understand when and which change version to select.

You will then be prompted to enter a description as to what your changes do. When
a release is cut and published these will be added to a list in the changelog
informing developers what changes occurred in that release.

### Steps to create a new release

1. After your PR is approved and merged into the `main` branch, navigate to the
   `[prepare-publish](https://github.com/codecov/codecov-javascript-bundler-plugins/actions/workflows/prepare-publish.yml)` action, and run the action on the `main` branch. This will
   create a new pull request that when merged will publish a new version of the
   plugins.
2. Navigate to the pull request that was created by the `prepare-publish`.
   Because of some limitations around GitHub Actions, you will have to manually
   open and close the PR to get the CI to fully run and pass the status checks.
3. Once all of the status checks have passed, you will be able to merge your pull
   request. After merging the pull request, a workflow will run that will automatically
   publish the packages to NPM, and create a GitHub release.
