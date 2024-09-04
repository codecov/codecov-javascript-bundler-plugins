import { type Output } from "@codecov/bundler-plugin-core";

/** Configuration options for the standalone analyzer. */
export interface StandaloneOptions {
  /**
   * Asynchronous function to handle dry run operations.
   *
   * This function is called when a dry run is performed. By default, it logs the report as a JSON
   * string using `console.log`.
   *
   * @returns {Promise<void>} A promise that resolves when the dry run operation is complete.
   */
  dryRunner?: (report: Output) => Promise<void>;

  /**
   * Asynchronous function to customize the report output.
   *
   * This function allows you to modify the report output before it is finalized. By default, it
   * returns the original output without modification.
   *
   * @returns {Promise<Output>} A promise that resolves to the customized output.
   */
  reportOverrider?: (original: Output) => Promise<Output>;
}

/* defaultStandaloneOptions are default implementations for `StandaloneOptions` */
const defaultStandaloneOptions: Required<StandaloneOptions> = {
  // eslint-disable-next-line @typescript-eslint/require-await
  dryRunner: async (report: Output): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(report.bundleStatsToJson());
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  reportOverrider: async (original: Output): Promise<Output> => original,
};

/* normalizeStandaloneOptions fills in missing standalone options with default values */
export function normalizeStandaloneOptions(
  options: Partial<StandaloneOptions> = {},
): Required<StandaloneOptions> {
  return { ...defaultStandaloneOptions, ...options };
}
