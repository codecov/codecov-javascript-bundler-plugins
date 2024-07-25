export function getBundleName(
  initialName = "",
  initialDir = "",
  format: string,
  name: string | undefined,
) {
  let bundleName = name ? `${initialName}-${name}` : initialName;

  const dir = initialDir.includes("server")
    ? "server"
    : initialDir.includes("client")
      ? "client"
      : undefined;
  if (dir) {
    bundleName = `${bundleName}-${dir}`;
  }

  format = format === "es" ? "esm" : format;
  bundleName = `${bundleName}-${format}`;

  return bundleName;
}
