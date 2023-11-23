import childProcess from "child_process";
import td from "testdouble";

import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "@/utils/constants.ts";
import * as Local from "../Local.ts";
import { createEmptyArgs } from "@test-utils/helpers.ts";

describe("Local Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run with git not installed", () => {
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(spawnSync("git")).thenReturn({
        error: new Error("Git is not installed!"),
      });
      const detected = Local.detect();
      expect(detected).toBeFalsy();
    });

    it("does run with git installed", () => {
      const detected = Local.detect();
      expect(detected).toBeTruthy();
    });
  });

  it("returns on override args", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: "main",
          pr: "1",
          sha: "testingsha",
          slug: "owner/repo",
        },
      },
      envs: {},
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "1",
      service: "",
      slug: "owner/repo",
    };
    const params = await Local.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("returns on override args + env vars", async () => {
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          pr: "1",
          slug: "owner/repo",
        },
      },
      envs: {
        GIT_COMMIT: "testingsha",
        GIT_BRANCH: "main",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "main",
      build: "",
      buildURL: "",
      commit: "testingsha",
      job: "",
      pr: "1",
      service: "",
      slug: "owner/repo",
    };
    const params = await Local.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("returns errors on git command failures", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {},
    };
    const spawnSync = td.replace(childProcess, "spawnSync");
    await expect(Local.getServiceParams(inputs)).rejects.toThrow();

    td.when(
      spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from("main"),
    });
    await expect(Local.getServiceParams(inputs)).rejects.toThrow();

    td.when(
      spawnSync("git", ["rev-parse", "HEAD"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from("testSHA"),
    });
    await expect(Local.getServiceParams(inputs)).rejects.toThrow();
  });

  describe("getSlug()", () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {},
    };

    it("can get the slug from a git url", async () => {
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("git@github.com:testOrg/testRepo.git"),
      });
      td.when(
        spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("main"),
      });
      td.when(
        spawnSync("git", ["rev-parse", "HEAD"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("testSHA"),
      });
      const params = await Local.getServiceParams(inputs);
      expect(params.slug).toBe("testOrg/testRepo");
    });

    it("can get the slug from an http(s) url", async () => {
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("notaurl"),
      });
      td.when(
        spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("main"),
      });
      td.when(
        spawnSync("git", ["rev-parse", "HEAD"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("testSHA"),
      });
      await expect(Local.getServiceParams(inputs)).rejects.toThrow();
    });

    it("errors on a malformed slug", async () => {
      const spawnSync = td.replace(childProcess, "spawnSync");
      td.when(
        spawnSync("git", ["config", "--get", "remote.origin.url"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("http://github.com/testOrg/testRepo.git"),
      });
      td.when(
        spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("main"),
      });
      td.when(
        spawnSync("git", ["rev-parse", "HEAD"], {
          maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
        }),
      ).thenReturn({
        stdout: Buffer.from("testSHA"),
      });
      const params = await Local.getServiceParams(inputs);
      expect(params.slug).toBe("testOrg/testRepo");
    });
  });
});
