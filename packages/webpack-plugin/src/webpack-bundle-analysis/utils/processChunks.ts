import { type StatsChunk } from "webpack";

export interface ProcessChunksArgs {
  chunks: StatsChunk[];
  chunkIdMap: Map<number | string, string>;
}

export const processChunks = ({ chunks, chunkIdMap }: ProcessChunksArgs) => {
  let idCounter = 0;
  return chunks.map((chunk) => {
    const chunkId = chunk.id ?? "";
    const uniqueId = `${idCounter}-${chunkId}`;
    chunkIdMap.set(chunkId, uniqueId);
    idCounter += 1;

    return {
      id: chunk.id?.toString() ?? "",
      uniqueId: uniqueId,
      entry: chunk.entry,
      initial: chunk.initial,
      files: chunk.files ?? [],
      names: chunk.names ?? [],
    };
  });
};
