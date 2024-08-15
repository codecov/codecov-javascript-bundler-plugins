import { describe, it, expect } from "vitest";
import { type StatsChunk } from "webpack";

import { processChunks } from "../processChunks";

describe("processChunks", () => {
  describe("there are ids present", () => {
    it("should process chunks", () => {
      const chunks = [
        {
          id: 1,
          entry: true,
          initial: true,
          files: ["file1.js"],
          names: ["chunk1"],
          rendered: true,
          recorded: true,
          size: 1000,
          hash: "hash1",
        },
        {
          id: 2,
          entry: true,
          initial: true,
          files: ["file2.js"],
          names: ["chunk2"],
          rendered: true,
          recorded: true,
          size: 2000,
          hash: "hash2",
        },
      ] satisfies StatsChunk[];

      const chunkIdMap = new Map();

      expect(processChunks({ chunks, chunkIdMap })).toEqual([
        {
          id: "1",
          uniqueId: "0-1",
          entry: true,
          initial: true,
          files: ["file1.js"],
          names: ["chunk1"],
        },
        {
          id: "2",
          uniqueId: "1-2",
          entry: true,
          initial: true,
          files: ["file2.js"],
          names: ["chunk2"],
        },
      ]);
    });
  });

  describe("there are no ids present", () => {
    it("should process chunks", () => {
      const chunks = [
        {
          entry: true,
          initial: true,
          files: ["file1.js"],
          names: ["chunk1"],
          rendered: true,
          recorded: true,
          size: 1000,
          hash: "hash1",
        },
        {
          entry: true,
          initial: true,
          files: ["file2.js"],
          names: ["chunk2"],
          rendered: true,
          recorded: true,
          size: 2000,
          hash: "hash2",
        },
      ] satisfies StatsChunk[];

      const chunkIdMap = new Map();

      expect(processChunks({ chunks, chunkIdMap })).toEqual([
        {
          id: "",
          uniqueId: "0-",
          entry: true,
          initial: true,
          files: ["file1.js"],
          names: ["chunk1"],
        },
        {
          id: "",
          uniqueId: "1-",
          entry: true,
          initial: true,
          files: ["file2.js"],
          names: ["chunk2"],
        },
      ]);
    });
  });
});
