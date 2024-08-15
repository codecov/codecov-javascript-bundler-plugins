import { type StatsModule } from "webpack";

export interface ProcessChunksArgs {
  modules: StatsModule[];
  chunkIdMap: Map<number | string, string>;
}

export const processModules = ({ modules, chunkIdMap }: ProcessChunksArgs) => {
  return modules.map((module) => {
    const chunks = module.chunks ?? [];
    const chunkUniqueIds: string[] = [];

    chunks.forEach((chunk) => {
      const chunkUniqueId = chunkIdMap.get(chunk);

      if (chunkUniqueId) {
        chunkUniqueIds.push(chunkUniqueId);
      }
    });

    return {
      name: module.name ?? "",
      size: module.size ?? 0,
      chunkUniqueIds: chunkUniqueIds,
    };
  });
};
