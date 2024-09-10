// rollup will replace these during the build. If not defined (e.g., in tests), fall back to defaults.

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const PLUGIN_NAME: string =
  // @ts-expect-error - value replaced by rollup
  typeof __PACKAGE_NAME__ !== "undefined"
    ? // @ts-expect-error - value replaced by rollup
      __PACKAGE_NAME__
    : "@codecov/bundle-analyzer";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const PLUGIN_VERSION: string =
  // @ts-expect-error - value replaced by rollup
  typeof __PACKAGE_VERSION__ !== "undefined" ? __PACKAGE_VERSION__ : "0.0.0";
