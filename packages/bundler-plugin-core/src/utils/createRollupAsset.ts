import { type MetaFramework } from "../types";
import { getCompressedSize } from "./getCompressedSize.ts";
import { normalizePath } from "./normalizePath.ts";

interface CreateAssetOptions {
  fileName: string;
  source: Uint8Array | string;
  formatString: string;
  metaFramework: MetaFramework;
}

export const createRollupAsset = async ({
  source,
  fileName,
  formatString,
  metaFramework,
}: CreateAssetOptions) => {
  const size =
    source instanceof Buffer
      ? source.byteLength
      : Buffer.from(source).byteLength;

  const gzipSize = await getCompressedSize({
    fileName,
    code: source,
  });

  return {
    name: fileName,
    size: size,
    gzipSize: gzipSize,
    normalized: normalizePath(fileName, formatString, metaFramework),
  };
};
