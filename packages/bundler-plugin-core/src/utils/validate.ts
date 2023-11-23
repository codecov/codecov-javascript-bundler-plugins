import { z } from "zod";

const GIT_SHA_LENGTH = 40;

const GIT_SHA_REGEX = /^[0-9a-f]+$/;

export function validateSHA(
  commitSHA: string,
  requestedLength: number = GIT_SHA_LENGTH,
) {
  const commitSHASchema = z
    .string()
    .length(requestedLength)
    .refine((value) => GIT_SHA_REGEX.test(value));

  const parsedSHA = commitSHASchema.safeParse(commitSHA);

  return parsedSHA.success;
}
