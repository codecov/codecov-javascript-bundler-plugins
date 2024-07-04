import { InvalidSlugError } from "../errors/InvalidSlugError";
import { OWNER_SLUG_JOIN, REPO_SLUG_JOIN } from "./constants";
import { red } from "./logging";

export const preProcessBody = (
  body: Record<string, string | null | undefined>,
) => {
  for (const [key, value] of Object.entries(body)) {
    if (key === "slug" && typeof value === "string") {
      body[key] = encodeSlug(value);
    }

    // temporary removal for testing
    if (key === "compareSha") {
      delete body[key];
    }

    if (!value || value === "") {
      body[key] = null;
    }
  }

  return body;
};

export const encodeSlug = (slug: string): string => {
  const repoIndex = slug.lastIndexOf("/") + 1;
  const owner = slug.substring(0, repoIndex).trimEnd();
  const repo = slug.substring(repoIndex, slug.length);

  if (owner === "" || repo === "") {
    red("Invalid owner and/or repo");
    throw new InvalidSlugError("Invalid owner and/or repo");
  }

  const encodedOwner = owner?.split("/").join(OWNER_SLUG_JOIN).slice(0, -3);
  const encodedSlug = [encodedOwner, repo].join(REPO_SLUG_JOIN);

  return encodedSlug;
};
