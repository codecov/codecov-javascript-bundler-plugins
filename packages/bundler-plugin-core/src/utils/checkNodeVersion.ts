import { satisfies } from "semver";
import { type UnpluginContextMeta } from "unplugin";
import { red } from "./logging";

const NODE_VERSION_RANGE = ">=18.18.0";

export function checkNodeVersion(unpluginMetaContext: UnpluginContextMeta) {
  if (!satisfies(process.version, NODE_VERSION_RANGE)) {
    red(
      `Codecov ${unpluginMetaContext.framework} bundler plugin requires Node.js ${NODE_VERSION_RANGE}. You are using Node.js ${process.version}. Please upgrade your Node.js version.`,
    );

    return true;
  }

  return false;
}
