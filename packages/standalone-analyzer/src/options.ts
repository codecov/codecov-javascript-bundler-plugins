import { type Output } from "@codecov/bundler-plugin-core";

/** Configuration options for the standalone analyzer. */
export interface StandaloneOptions {
  /**
   * Asynchronous function to customize the report output.
   *
   * This function allows you to modify the report output before it is finalized. By default, it
   * returns the original output without modification.
   *
   * @returns {Promise<Output>} A promise that resolves to the customized output.
   */
  beforeReportUpload?: (original: Output) => Promise<Output>;
}

/* defaultStandaloneOptions are default implementations for `StandaloneOptions` */
const defaultStandaloneOptions: Required<StandaloneOptions> = {
  // eslint-disable-next-line @typescript-eslint/require-await
  beforeReportUpload: async (original: Output): Promise<Output> => original,
};

/* normalizeStandaloneOptions fills in missing standalone options with default values */
export function normalizeStandaloneOptions(
  options: Partial<StandaloneOptions> = {},
): Required<StandaloneOptions> {
  return { ...defaultStandaloneOptions, ...options };
}
