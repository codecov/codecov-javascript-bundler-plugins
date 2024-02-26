import { type Options } from "../types.ts";
import { z } from "zod";

export type NormalizedOptions = z.infer<typeof optionsSchema> & Options;

const validBundleName = /^[\w\d_:/@\.{}\[\]$-]+$/;

const optionsSchema = z.object({
  apiUrl: z.string().url().default("https://api.codecov.io"),
  dryRun: z.boolean().default(false),
  bundleName: z.string().regex(validBundleName),
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
  const validatedOptions = optionsSchema.safeParse(userOptions);

  if (!validatedOptions.success) {
    const errorMessages: string[] = [];
    const issues = validatedOptions.error.issues;

    for (const issue of issues) {
      if (issue.path.at(0)?.toString() === "bundleName") {
        errorMessages.push(
          `The bundleName "${userOptions.bundleName}" is invalid. It must match the pattern ${validBundleName}`,
        );
      }

      if (issue.path.at(0)?.toString() === "apiUrl") {
        errorMessages.push(
          `The apiUrl "${userOptions.apiUrl}" is invalid. It must be a valid URL`,
        );
      }

      if (issue.path.at(0)?.toString() === "dryRun") {
        errorMessages.push(
          `The dryRun option "${userOptions.dryRun}" is invalid. It must be a boolean`,
        );
      }
    }

    return {
      success: false,
      errors: errorMessages,
    };
  }

  const options = {
    ...userOptions,
    ...validatedOptions.data,
  };

  return {
    options,
    success: true,
  };
};
