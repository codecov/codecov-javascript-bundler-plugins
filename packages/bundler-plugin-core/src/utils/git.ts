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

export function parseSlugFromRemoteAddr(remoteAddr?: string): string {
  const addr =
    remoteAddr ??
    runExternalProgram("git", ["config", "--get", "remote.origin.url"]) ??
    "";
  if (!addr) {
    return "";
  }

  const slug = parseSlug(addr);
  if (slug === "/") {
    return "";
  }
  return slug;
}
