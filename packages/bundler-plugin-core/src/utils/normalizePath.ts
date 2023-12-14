const HASH_REGEX = /[a-f0-9]{8,}/i;
const POTENTIAL_HASHES = [
  "[hash]",
  "[contenthash]",
  "[fullhash]",
  "[chunkhash]",
  "[contenthash]",
];

export const normalizePath = (path: string, format: string): string => {
  let hashString = "";
  let hashIndex = NaN;
  POTENTIAL_HASHES.forEach((hash) => {
    const index = format.indexOf(hash);
    if (index !== -1) {
      hashIndex = index;
      hashString = hash;
    }
  });

  // if there's no hash in the format, then we can assume that the path is
  // is safe to return
  if (isNaN(hashIndex)) {
    return path;
  }

  const leadingDelimiter = format.at(hashIndex - 1);
  const endingDelimiter = format.at(hashIndex + hashString.length);
  const regexString = `((?<leadingDelimiter>\\${leadingDelimiter})(?<hash>[0-9a-f]+)(?<endingDelimiter>\\${endingDelimiter}))`;
  const HASH_REPLACE_REGEX = new RegExp(regexString, "i");

  const normalizedPath = path.replace(
    HASH_REPLACE_REGEX,
    "$<leadingDelimiter>*$<endingDelimiter>",
  );

  // if the path is the same as the normalized path, and the path contains a
  // hash, then we can assume that something went wrong and we should just
  // replace the hash with a wildcard
  if (normalizedPath === path && HASH_REGEX.test(normalizedPath)) {
    return normalizedPath.replace(HASH_REGEX, "*");
  }

  return normalizedPath;
};
