import { type RollupModuleFormat } from "@codecov/vite-plugin";

export function getBundleName(
  initialName = "",
  initialDir = "",
  format: RollupModuleFormat,
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

  const correctedFormat = format === "es" ? "esm" : format;
  bundleName = `${bundleName}-${correctedFormat}`;

  return bundleName;
}
