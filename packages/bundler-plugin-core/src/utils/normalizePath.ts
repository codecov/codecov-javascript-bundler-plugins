const HASH_REGEX = /[a-f0-9]{8,}/i;
const POTENTIAL_HASHES = [
  "[hash]",
  "[contenthash]",
  "[fullhash]",
  "[chunkhash]",
];

const escapeRegex = (string: string): string =>
  string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");

interface HashMatch {
  hashString: string;
  hashIndex: number;
}

export const normalizePath = (path: string, format: string): string => {
  // grab all potential hashes in the format string
  const matches: HashMatch[] = [];
  for (const hash of POTENTIAL_HASHES) {
    const index = format.indexOf(hash);
    if (index !== -1) {
      matches.push({ hashString: hash, hashIndex: index });
    }
  }

  let normalizedPath = path;
  // loop through all the matches and replace the hash with a wildcard
  for (const match of matches) {
    // grab the leading delimiter and create a regex group for it
    const leadingDelimiter = format.at(match.hashIndex - 1) ?? "";
    const leadingRegex = `(?<leadingDelimiter>${escapeRegex(
      leadingDelimiter,
    )})`;

    // grab the ending delimiter and create a regex group for it
    const endingDelimiter =
      format.at(match.hashIndex + match.hashString.length) ?? "";
    const endingRegex = `(?<endingDelimiter>${escapeRegex(endingDelimiter)})`;

    // create a regex that will match the hash
    // potential values gathered from: https://en.wikipedia.org/wiki/Base64
    // added in `\-` to account for the `-` character which seems to be used by Rollup through testing
    const regexString = `(${leadingRegex}(?<hash>[0-9a-zA-Z+=-]+)${endingRegex})`;
    const HASH_REPLACE_REGEX = new RegExp(regexString, "i");

    // replace the hash with a wildcard and the delimiters
    normalizedPath = normalizedPath.replace(
      HASH_REPLACE_REGEX,
      "$<leadingDelimiter>*$<endingDelimiter>",
    );
  }

  // if the path is the same as the normalized path, and the path contains a
  // hash, then we can assume that something went wrong and we should just
  // replace/brute force the hash with a wildcard
  if (normalizedPath === path && HASH_REGEX.test(normalizedPath)) {
    return normalizedPath.replace(HASH_REGEX, "*");
  }

  return normalizedPath;
};
