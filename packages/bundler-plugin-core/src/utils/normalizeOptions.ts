import { z } from "zod";
import { type Options } from "../types.ts";
import { red } from "./logging.ts";

export type NormalizedOptions = z.infer<
  ReturnType<typeof optionsSchemaFactory>
> &
  Options;

const validBundleName = /^[\w\d_:/@\.{}\[\]$-]+$/;

const UploadOverridesSchema = z.object({
  branch: z
    .string({
      invalid_type_error: "`branch` must be a string.",
    })
    .optional(),
  build: z
    .string({
      invalid_type_error: "`build` must be a string.",
    })
    .optional(),
  pr: z
    .string({
      invalid_type_error: "`pr` must be a string.",
    })
    .optional(),
  sha: z
    .string({
      invalid_type_error: "`sha` must be a string.",
    })
    .optional(),
  slug: z
    .string({
      invalid_type_error: "`slug` must be a string.",
    })
    .optional(),
});

const optionsSchemaFactory = (options: Options) =>
  z.object({
    apiUrl: z
      .string({
        invalid_type_error: "`apiUrl` must be a string.",
      })
      .url({
        message: `apiUrl: \`${options?.apiUrl}\` is not a valid URL.`,
      })
      .default("https://api.codecov.io"),
    bundleName: z
      .string({
        invalid_type_error: "`bundleName` must be a string.",
        required_error:
          "`bundleName` is required for uploading bundle analysis information.",
      })
      .regex(validBundleName, {
        message: `bundleName: \`${options?.bundleName}\` does not match format: \`/^[\w\d_:/@\.{}\[\]$-]+$/\`.`,
      }),
    dryRun: z
      .boolean({
        invalid_type_error: "`dryRun` must be a boolean.",
      })
      .default(false),
    retryCount: z
      .number({
        invalid_type_error: "`retryCount` must be a number.",
      })
      .positive({
        message: "`retryCount` must be a positive number.",
      })
      .int({
        message: "`retryCount` must be an integer.",
      })
      .default(3),
    enableBundleAnalysis: z
      .boolean({
        invalid_type_error: "`enableBundleAnalysis` must be a boolean.",
      })
      .default(false),
    uploadToken: z
      .string({ invalid_type_error: "`uploadToken` must be a string." })
      .optional(),
    uploadOverrides: UploadOverridesSchema.optional(),
    debug: z
      .boolean({
        invalid_type_error: "`debug` must be a boolean.",
      })
      .default(false),
  });

interface NormalizedOptionsFailure {
  success: false;
  errors: string[];
}

interface NormalizedOptionsSuccess {
  success: true;
  options: NormalizedOptions;
}

/**
 * This type represents a union of possible results from the the function.
 *
 * @see {@link normalizeOptions}
 */
export type NormalizedOptionsResult =
  | NormalizedOptionsFailure
  | NormalizedOptionsSuccess;

/**
 * This function is used to normalize the options provided by the user. Validating the options
 * passed by the user, and providing default values for a given set of options if none were
 * provided.
 *
 * @param {Options} userOptions
 * @returns {NormalizedOptionsResult}
 */
export const normalizeOptions = (
  userOptions: Options,
): NormalizedOptionsResult => {
  const optionsSchema = optionsSchemaFactory(userOptions);
  const validatedOptions = optionsSchema.safeParse(userOptions);

  if (!validatedOptions.success) {
    const errorMessages: string[] = [];
    const issues = validatedOptions.error.issues;

    for (const issue of issues) {
      errorMessages.push(issue.message);
    }

    return {
      success: false,
      errors: errorMessages,
    };
  }

  return {
    options: validatedOptions.data,
    success: true,
  };
};

/**
 * This function logs the errors to the console, and will exit if there are any `bundleName` errors.
 *
 * @param {NormalizedOptionsFailure} options - The normalized options that failed validation.
 */
export const handleErrors = (options: NormalizedOptionsFailure) => {
  let hasBundleNameError = false;
  // we probably don't want to exit early so we can provide all the errors to the user
  for (const error of options.errors) {
    // if the error is related to the bundleName, we should set a flag
    if (error.includes("bundleName")) {
      hasBundleNameError = true;
    }
    red(error);
  }

  // since bundle names are required, we should exit if the bundleName fails validation
  if (hasBundleNameError) {
    process.exit(1);
  }
};
