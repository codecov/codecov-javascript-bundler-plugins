import { describe, it, expect } from "vitest";
import { type StatsModule } from "webpack";

import { processModules } from "../processModules";

describe("processModules", () => {
  describe("modules have chunks", () => {
    it("should process modules", () => {
      const modules = [
        {
          name: "module1",
          size: 1000,
          chunks: [1],
        },
        {
          name: "module2",
          size: 2000,
          chunks: [2],
        },
      ] satisfies StatsModule[];

      const chunkIdMap = new Map();
      chunkIdMap.set(1, "0-1");
      chunkIdMap.set(2, "1-2");

      expect(processModules({ modules, chunkIdMap })).toEqual([
        {
          name: "module1",
          size: 1000,
          chunkUniqueIds: ["0-1"],
        },
        {
          name: "module2",
          size: 2000,
          chunkUniqueIds: ["1-2"],
        },
      ]);
    });
  });

  describe("modules have no chunks", () => {
    it("should process modules", () => {
      const modules = [
        {
          name: "module1",
          size: 1000,
        },
        {
          name: "module2",
          size: 2000,
        },
      ] satisfies StatsModule[];

      const chunkIdMap = new Map();

      expect(processModules({ modules, chunkIdMap })).toEqual([
        {
          name: "module1",
          size: 1000,
          chunkUniqueIds: [],
        },
        {
          name: "module2",
          size: 2000,
          chunkUniqueIds: [],
        },
      ]);
    });
  });
});
