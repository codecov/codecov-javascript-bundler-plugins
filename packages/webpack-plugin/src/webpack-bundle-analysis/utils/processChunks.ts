import { red } from "@codecov/bundler-plugin-core";
import { type StatsChunk } from "webpack";

export interface ProcessChunksArgs {
  chunks: StatsChunk[];
  chunkIdMap: Map<number | string, string>;
}

export const processChunks = ({ chunks, chunkIdMap }: ProcessChunksArgs) => {
  const chunkMap = new Map<PropertyKey, StatsChunk>();

  // need to collect all possible chunk ids beforehand so we can use them to
  // collect the dynamic imports
  chunks.forEach((chunk) => {
    if (chunk.id) {
      chunkMap.set(chunk.id.toString(), chunk);
    }
  });

  return chunks.map((chunk, index) => {
    const chunkId = chunk.id ?? "";
    const uniqueId = `${index}-${chunkId}`;
    chunkIdMap.set(chunkId, uniqueId);

    const dynamicImports: string[] = [];
    chunk.children?.forEach((child) => {
      const childIdString = child.toString();
      const childChunk = chunkMap.get(childIdString);

      if (!childChunk || !childChunk.files) {
        red(`Child chunk ${childIdString} not found in chunkMap`);
      } else {
        dynamicImports.push(...childChunk.files);
      }
    });

    return {
      id: chunk.id?.toString() ?? "",
      uniqueId: uniqueId,
      entry: chunk.entry,
      initial: chunk.initial,
      files: chunk.files ?? [],
      names: chunk.names ?? [],
      dynamicImports: dynamicImports,
    };
  });
};
