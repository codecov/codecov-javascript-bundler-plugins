import { type Options } from "../types.ts";
import { z } from "zod";

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
    sentry: z
      .object({
        sentryOnly: z.boolean({
          invalid_type_error: "`sentry.sentryOnly` must be a boolean.",
        }),
        isEnabled: z.boolean({
          invalid_type_error: "`sentry.isEnabled` must be a boolean.",
        }),
        org: z.string({ invalid_type_error: "`sentry.org` must be a string." }),
        project: z.string({
          invalid_type_error: "`sentry.project` must be a string.",
        }),
        environment: z.string({
          invalid_type_error: "`sentry.enviornment` must be a string.",
        }),
      })
      .optional(),
  });

interface NormalizedOptionsFailure {
  success: false;
  errors: string[];
}

interface NormalizedOptionsSuccess {
  success: true;
  options: NormalizedOptions;
}

export type NormalizedOptionsResult =
  | NormalizedOptionsFailure
  | NormalizedOptionsSuccess;

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
