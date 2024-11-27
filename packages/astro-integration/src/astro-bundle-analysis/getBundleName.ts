export function getBundleName(
  initialName = "",
  target: "client" | "server",
  format: string,
  name: string | undefined,
) {
  let bundleName = name
    ? `${initialName}-${name}-${target}`
    : `${initialName}-${target}`;

  format = format === "es" ? "esm" : format;
  bundleName = `${bundleName}-${format}`;

  return bundleName;
}
