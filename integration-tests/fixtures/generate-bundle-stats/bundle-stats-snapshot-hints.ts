import { expect } from "bun:test";

/**
 * Use inside `toMatchSnapshot({ ... })` for bundle stats payloads that include `assets[]`.
 * Compressed size (`gzipSize`) varies by OS and Node.js zlib, so snapshots must not pin it.
 */
export function bundleStatsAssetsHint() {
  return expect.arrayContaining([
    expect.objectContaining({
      gzipSize: expect.any(Number),
      name: expect.any(String),
      normalized: expect.any(String),
      size: expect.any(Number),
    }),
  ]);
}
