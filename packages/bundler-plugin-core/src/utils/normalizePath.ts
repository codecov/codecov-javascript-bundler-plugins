const HASH_REGEX = /[a-f0-9]{8,}/i;
const POTENTIAL_HASHES = ["[contenthash", "[fullhash", "[chunkhash", "[hash"];

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

    const closingBracketIndex = format.slice(match.hashIndex).indexOf("]");
    // grab the ending delimiter and create a regex group for it
    let endingDelimiter =
      format.at(match.hashIndex + closingBracketIndex + 1) ?? "";

    // If the ending delimiter is `[extname]` there won't be a
    // `.<file-extension>` so we need to replace it with a `.` for the
    // handling the actual filename, which will have the `.` in the * string.

    if (endingDelimiter === "[") {
      endingDelimiter = ".";
    }
    const endingRegex = `(?<endingDelimiter>${escapeRegex(endingDelimiter)})`;

    // create a regex that will match the hash
    // potential values gathered from: https://en.wikipedia.org/wiki/Base64
    // added in `\-` and `\_` to account for the `-` `_` as they are included in the potential hashes: https://rollupjs.org/configuration-options/#output-hashcharacters
    const regexString = `(${leadingRegex}(?<hash>[0-9a-zA-Z/+=_\/+=-]+)${endingRegex})`;
    const HASH_REPLACE_REGEX = new RegExp(regexString, "i");

    // replace the hash with a wildcard and the delimiters
    normalizedPath = normalizedPath.replace(
      HASH_REPLACE_REGEX,
      "$<leadingDelimiter>*$<endingDelimiter>",
    );
  }

  // handle vite legacy builds
  if (normalizedPath === path && path.includes("legacy")) {
    const regexReplacement =
      /(?<leadingDelimiter>\S+-legacy-)(?<hash>[0-9a-zA-Z\/+=_\/+=-]+)(?<endingDelimiter>.\S+)/i;

    normalizedPath = normalizedPath.replace(
      regexReplacement,
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
