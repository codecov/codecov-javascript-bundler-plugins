import { red } from "@codecov/bundler-plugin-core";
import { type StatsChunk } from "@rspack/core";

export interface ProcessChunksArgs {
  chunks: StatsChunk[];
  chunkIdMap: Map<number | string, string>;
}

export const processChunks = ({ chunks, chunkIdMap }: ProcessChunksArgs) => {
  // need a reference of all chunks by their id so we can use it to collect
  // the dynamic imports from the children chunks without having to search
  // through the entire list of chunks every time
  const referenceChunkMapById = new Map<PropertyKey, StatsChunk>();
  chunks.forEach((chunk) => {
    if (chunk.id) {
      referenceChunkMapById.set(chunk.id.toString(), chunk);
    }
  });

  return chunks.map((chunk, index) => {
    const chunkId = chunk.id ?? "";
    const uniqueId = `${index}-${chunkId}`;
    chunkIdMap.set(chunkId, uniqueId);

    const dynamicImports: string[] = [];
    chunk.children?.forEach((child) => {
      const childIdString = child.toString();
      const childChunk = referenceChunkMapById.get(childIdString);

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
