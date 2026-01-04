const STRIP_CHARS_REGEX = /(\w|\[|]|\/)/g;

export interface FindFilenameFormatArgs {
  assetName: string;
  filename: string;
  assetModuleFilename: string;
  chunkFilename: string;
  cssFilename: string;
  cssChunkFilename: string;
}

export const findFilenameFormat = ({
  assetName,
  filename,
  assetModuleFilename,
  chunkFilename,
  cssFilename,
  cssChunkFilename,
}: FindFilenameFormatArgs) => {
  const currAssetFormat = assetName.replaceAll(STRIP_CHARS_REGEX, "");

  if (
    filename !== "" &&
    currAssetFormat.includes(filename.replaceAll(STRIP_CHARS_REGEX, ""))
  ) {
    return filename;
  }

  if (
    chunkFilename !== "" &&
    currAssetFormat.includes(chunkFilename.replaceAll(STRIP_CHARS_REGEX, ""))
  ) {
    return chunkFilename;
  }

  if (
    cssFilename !== "" &&
    currAssetFormat.includes(cssFilename.replaceAll(STRIP_CHARS_REGEX, ""))
  ) {
    return cssFilename;
  }

  if (
    cssChunkFilename !== "" &&
    currAssetFormat.includes(cssChunkFilename.replaceAll(STRIP_CHARS_REGEX, ""))
  ) {
    return cssChunkFilename;
  }

  if (
    assetModuleFilename !== "" &&
    currAssetFormat.includes(
      assetModuleFilename.replaceAll(STRIP_CHARS_REGEX, ""),
    )
  ) {
    return assetModuleFilename;
  }

  return "";
};
