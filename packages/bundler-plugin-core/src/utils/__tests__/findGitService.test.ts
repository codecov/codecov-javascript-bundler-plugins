import { describe, it, expect, afterAll, beforeAll } from "vitest";
import childProcess from "child_process";
import * as td from "testdouble";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../constants.ts";

import { findGitService, parseGitService, splitPath } from "../findGitService";

describe("findGitService", () => {
  const spawnSync = td.replace(childProcess, "spawnSync");

  afterAll(() => {
    td.reset();
  });

  describe('git remote "origin" exists', () => {
    beforeAll(() => {
      td.when(
        spawnSync("git", ["remote"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("origin\n"),
      });

      td.when(
        spawnSync("git", ["ls-remote", "--get-url", "origin"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("git@github.com:codecov/codecov-cli.git\n"),
      });
    });

    it('should return "github"', () => {
      expect(findGitService()).toBe("github");
    });
  });

  describe('git remote "origin" does not exist', () => {
    beforeAll(() => {
      td.when(
        spawnSync("git", ["remote"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("random-remote\n"),
      });

      td.when(
        spawnSync("git", ["ls-remote", "--get-url", "random-remote"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from(
          "https://user-name@bitbucket.org/namespace-codecov/first_repo.git\n",
        ),
      });
    });

    it('should return "bitbucket"', () => {
      expect(findGitService()).toBe("bitbucket");
    });
  });

  describe("there are no remotes", () => {
    beforeAll(() => {
      td.when(
        spawnSync("git", ["remote"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from(""),
      });
    });

    it("should throw an error", () => {
      expect(findGitService).toThrowError("No remote found");
    });
  });
});

describe("parseGitService", () => {
  const cases = [
    { input: "https://github.com/codecov/codecov-cli.git", expected: "github" },
    { input: "git@github.com:codecov/codecov-cli.git", expected: "github" },
    {
      input: "ssh://git@github.com/gitcodecov/codecov-cli",
      expected: "github",
    },
    {
      input: "ssh://git@github.com/gitcodecov/codecov-cli",
      expected: "github",
    },
    {
      input: "https://user-name@bitbucket.org/namespace-codecov/first_repo.git",
      expected: "bitbucket",
    },
    {
      input: "https://random-git-service.org/namespace-codecov/first_repo.git",
      expected: undefined,
    },
  ];

  it.each(cases)(
    "should parse $expected from $input",
    ({ input, expected }) => {
      expect(parseGitService(input)).toBe(expected);
    },
  );
});

describe("splitPath", () => {
  describe("`@` in path", () => {
    it("should split path correctly and take last entry", () => {
      expect(splitPath("something@nothing")).toBe("nothing");
    });
  });

  describe("`:` in path", () => {
    it("should split path correctly and take first entry", () => {
      expect(splitPath("something:nothing")).toBe("something");
    });
  });

  describe("`.` in path", () => {
    it("should split path correctly and take first entry", () => {
      expect(splitPath("something.nothing")).toBe("something");
    });
  });
});
