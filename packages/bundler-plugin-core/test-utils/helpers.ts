import {
  beforeAll,
  vi,
  afterEach,
  type MockInstance,
  expect,
  afterAll,
} from "vitest";
import { type UploadOverrides } from "../src/types.ts";
import childProcess from "child_process";

let execSync: MockInstance;
let exec: MockInstance;

beforeAll(() => {
  execSync = vi.spyOn(childProcess, "execSync").mockImplementation(() => {
    throw new Error(
      `Security alert! Do not use execSync(), use spawnSync() instead`,
    );
  });
  exec = vi.spyOn(childProcess, "exec").mockImplementation(() => {
    throw new Error(`Security alert! Do not use exec(), use spawn() instead`);
  });
});

afterEach(() => {
  expect(execSync).not.toHaveBeenCalled();
  expect(exec).not.toHaveBeenCalled();
});

afterAll(() => {
  vi.restoreAllMocks();
});

export function createEmptyArgs(): UploadOverrides {
  return {
    build: undefined,
    branch: undefined,
    pr: undefined,
    sha: undefined,
    slug: undefined,
  };
}
