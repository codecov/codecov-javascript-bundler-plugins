import { runExternalProgram } from "./runExternalProgram.ts";

export function parseSlug(slug: unknown): string {
  // origin    https://github.com/torvalds/linux.git (fetch)
  // git@github.com: codecov / uploader.git
  if (typeof slug !== "string") {
    return "";
  }

  if (slug.match(/^(ssh|https?):/)) {
    // Type is http(s) or ssh
    const phaseOne = slug.split("//")[1]?.replace(".git", "") ?? "";
    const phaseTwo = phaseOne?.split("/") ?? "";
    const cleanSlug =
      phaseTwo.length > 2 ? `${phaseTwo[1]}/${phaseTwo[2]}` : "";
    return cleanSlug;
  }

  if (slug.match("@")) {
    // Type is git
    const cleanSlug = slug.split(":")[1]?.replace(".git", "");
    return cleanSlug ?? "";
  }

  throw new Error(`Unable to parse slug URL: ${slug}`);
}

export function parseSlugFromRemoteAddr(remoteAddr?: string) {
  let slug = null;
  if (!remoteAddr) {
    remoteAddr =
      runExternalProgram("git", ["config", "--get", "remote.origin.url"]) || "";
  }

  if (remoteAddr) {
    slug = parseSlug(remoteAddr);
  }

  if (slug === "/") {
    slug = null;
  }
  return slug;
}
