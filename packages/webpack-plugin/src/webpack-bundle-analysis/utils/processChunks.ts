import { type StatsChunk } from "webpack";

export interface ProcessChunksArgs {
  chunks: StatsChunk[];
  chunkIdMap: Map<number | string, string>;
}

export const processChunks = ({ chunks, chunkIdMap }: ProcessChunksArgs) => {
  let idCounter = 0;
  const chunkMap = new Map<string, StatsChunk>();

  // need to collect all possible chunk ids beforehand
  chunks.forEach((chunk) => {
    chunkMap.set(chunk.id?.toString() ?? "", chunk);
  });

  return chunks.map((chunk) => {
    const chunkId = chunk.id ?? "";
    const uniqueId = `${idCounter}-${chunkId}`;
    chunkIdMap.set(chunkId, uniqueId);
    idCounter += 1;

    const dynamicImports: string[] = [];
    chunk.children?.forEach((child) => {
      const childChunk = chunkMap.get(child.toString());
      if (childChunk?.files) {
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
