import { z } from "zod";
import { type Options } from "../types.ts";
import { red } from "./logging.ts";

export type NormalizedOptions = z.infer<
  ReturnType<typeof optionsSchemaFactory>
> &
  Options;

const validBundleName = /^[\w\d_:/@\.{}\[\]$-]+$/;

export type ValidGitService = z.infer<typeof ValidGitServiceSchema>;

const ValidGitServiceSchema = z.union(
  [
    z.literal("github"),
    z.literal("gitlab"),
    z.literal("bitbucket"),
    z.literal("github_enterprise"),
    z.literal("gitlab_enterprise"),
    z.literal("bitbucket_server"),
  ],
  { invalid_type_error: "`gitService` must be a valid git service." },
);

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
  compareSha: z
    .string({
      invalid_type_error: "`compareSha` must be a string.",
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

const OIDCSchema = z.object(
  {
    useGitHubOIDC: z
      .boolean({
        invalid_type_error: "`useGitHubOIDC` must be a boolean.",
      })
      .default(false),
    /**
     * Following along with how we handle this in our GH Action.
     *
     * See: https://github.com/codecov/codecov-action/blob/main/src/buildExec.ts#L53-L58
     */
    gitHubOIDCTokenAudience: z
      .string({
        invalid_type_error: "`gitHubOIDCTokenAudience` must be a string.",
      })
      .optional()
      .default("https://codecov.io"),
  },
  { invalid_type_error: "`oidc` must be an object." },
);

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
    /**
     * Using an enum here, as custom error messages for union types seem to be broken currently.
     *
     * Issue: https://github.com/colinhacks/zod/issues/3675
     */
    gitService: z
      .enum(
        [
          "github",
          "gitlab",
          "bitbucket",
          "github_enterprise",
          "gitlab_enterprise",
          "bitbucket_server",
        ],
        { invalid_type_error: "`gitService` must be a valid git service." },
      )
      .optional(),
    oidc: OIDCSchema.optional(),
    telemetry: z
      .boolean({
        invalid_type_error: "`telemetry` must be a boolean.",
      })
      .default(true),
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
 * This function logs the errors to the console, and will return `shouldExit` if there are errors
 * that we should exit the build process for.
 *
 * @param {NormalizedOptionsFailure} options - The normalized options that failed validation.
 */
export const handleErrors = (options: NormalizedOptionsFailure) => {
  let shouldExit = false;
  // we probably don't want to exit early so we can provide all the errors to the user
  for (const error of options.errors) {
    // if the error is related to the bundleName, we should set a flag
    if (error.includes("bundleName")) {
      shouldExit = true;
    }
    red(error);
  }

  return { shouldExit };
};
