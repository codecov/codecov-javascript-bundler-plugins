export function setSlug(
  slugArg: string | undefined,
  orgEnv: string | undefined,
  repoEnv: string | undefined,
) {
  if (typeof slugArg !== "undefined" && slugArg !== "") {
    return slugArg;
  }

  if (
    typeof orgEnv !== "undefined" &&
    typeof repoEnv !== "undefined" &&
    orgEnv !== "" &&
    repoEnv !== ""
  ) {
    return `${orgEnv}/${repoEnv}`;
  }

  return "";
}
