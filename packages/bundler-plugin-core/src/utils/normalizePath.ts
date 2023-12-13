// const UUID_REGEX =
//   /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;

// const CHUNK_REGEX = /(?:[0-9]+)?\.[a-f0-9]{8}\.chunk/i;

// const VERSION_REGEX = /v[0-9]+(?:\.[0-9]+)/i;

// const HEX_REGEX = /[a-f0-9]{5}[a-f0-9]+/i;

// const TRAILING_HEX_REGEX = /-[a-f0-9]{5}[a-f0-9]+/i;

// const INT_REGEX = /\d\d+/i;

// const CONTENT_HASH_REGEX = /\[(contenthash|hash)\]/i;

// const HASH_REGEX = /[a-f0-9]{8}/gi;
// const HASH_REGEX = /((?<delimiter>-|\.)(?<hash>[0-9a-f]{8,}))/;

// vite/rollup default
// asset assets/[name]-[hash].[ext]
// chunk assets/[name]-[hash].js
// entry assets/[name]-[hash].js

// hashes "should" always be hex characters

// loop through both format string and file name
// continue until a square bracket is found grab contents until next square bracket
// if it's name or ext don't do anything
// if it's contenthash or hash replace with a *

export const normalizePath = (path: string, _format: string): string => {
  let hashString = "[hash]";
  if (_format.includes("[contenthash]")) {
    hashString = "[contenthash]";
  } else if (_format.includes("[fullhash]")) {
    hashString = "[fullhash]";
  } else if (_format.includes("[chunkhash]")) {
    hashString = "[chunkhash]";
  }

  const hashIndex = _format.indexOf(hashString);
  const leadingDelimiter = _format.at(hashIndex - 1);
  const endingDelimiter = _format.at(hashIndex + hashString.length);

  const regexString = `((?<leadingDelimiter>\\${leadingDelimiter})(?<hash>[0-9a-f]+)(?<endingDelimiter>\\${endingDelimiter}))`;
  console.log("regexString:", regexString);
  const tempRegex = new RegExp(regexString, "i");

  console.log("format:", _format);
  console.log("path:", path);
  console.log("leadingDelimiter:", leadingDelimiter);
  console.log("endingDelimiter:", endingDelimiter);

  const normalizedPath = path.replace(
    tempRegex,
    "$<leadingDelimiter>*$<endingDelimiter>",
  );
  console.log("normalizedPath:", normalizedPath);

  return normalizedPath;
};
