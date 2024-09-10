import { type Output } from "@codecov/bundler-plugin-core";

/** Configuration options for the bundle-analyzer analyzer. */
export interface BundleAnalyzerOptions {
  /**
   * Asynchronous function to customize the report output.
   *
   * This function allows you to modify the report output before it is finalized. By default, it
   * returns the original output without modification.
   *
   * @returns {Promise<Output>} A promise that resolves to the customized output.
   */
  beforeReportUpload?: (original: Output) => Promise<Output>;

  /**
   * Patterns to ignore certain files or directories in the analysis. The patterns follow the
   * standard glob pattern syntax. By default, it returns an empty list.
   */
  ignorePatterns?: string[];

  /**
   * A pattern to normalize asset names (e.g., for hashing). By default, it returns an empty string,
   * which will replace anything "hashlike" with "*".
   */
  normalizeAssetsPattern?: string;
}

/* defaultBundleAnalyzerOptions are default implementations for `BundleAnalyzerOptions` */
const defaultBundleAnalyzerOptions: Required<BundleAnalyzerOptions> = {
  // eslint-disable-next-line @typescript-eslint/require-await
  beforeReportUpload: async (original: Output): Promise<Output> => original,
  ignorePatterns: [],
  normalizeAssetsPattern: "",
};

/* normalizeBundleAnalyzerOptions fills in missing bundle-analyzer options with default values */
export function normalizeBundleAnalyzerOptions(
  options: Partial<BundleAnalyzerOptions> = {},
): Required<BundleAnalyzerOptions> {
  return {
    ...defaultBundleAnalyzerOptions,
    ...options,
  };
}
