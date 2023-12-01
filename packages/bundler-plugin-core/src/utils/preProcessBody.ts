import { OWNER_SLUG_JOIN, REPO_SLUG_JOIN } from "./constants";

export const preProcessBody = (
  body: Record<string, string | null | undefined>,
) => {
  for (const [key, value] of Object.entries(body)) {
    if (key === "slug" && typeof value === "string") {
      body[key] = encodeSlug(value);
    }

    if (!value || value === "") {
      body[key] = null;
    }
  }

  return body;
};

export const encodeSlug = (slug: string): string => {
  const owner = slug.substring(0, slug.lastIndexOf("/") + 1).trimEnd();
  const repo = slug.substring(slug.lastIndexOf("/") + 1, slug.length);

  const encodedOwner = owner?.split("/").join(OWNER_SLUG_JOIN).slice(0, -3);
  const encodedSlug = [encodedOwner, repo].join(REPO_SLUG_JOIN);

  return encodedSlug;
};
