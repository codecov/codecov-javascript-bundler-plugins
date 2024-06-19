import { promisify } from "node:util";
import { gzip } from "node:zlib";

const COMPRESSIBLE_ASSETS_RE = /\.(?:css|html|json|js|svg|txt|xml|xhtml)$/;

interface GetCompressedSizeOptions {
  fileName: string;
  code: string | Uint8Array;
}

export const getCompressedSize = async ({
  fileName,
  code,
}: GetCompressedSizeOptions) => {
  const isCompressible = COMPRESSIBLE_ASSETS_RE.test(fileName);

  if (!isCompressible) {
    return null;
  }

  const compress = promisify(gzip);

  const compressed = await compress(
    typeof code === "string" ? code : Buffer.from(code),
  );

  return compressed.length;
};
