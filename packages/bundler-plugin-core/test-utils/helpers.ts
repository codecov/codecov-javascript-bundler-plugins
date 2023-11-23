import { type UploadOverrides } from "../src/types.ts";
import childProcess from "child_process";

let execSync: jest.SpyInstance;
let exec: jest.SpyInstance;

beforeAll(() => {
  execSync = jest.spyOn(childProcess, "execSync").mockImplementation(() => {
    throw new Error(
      `Security alert! Do not use execSync(), use spawnSync() instead`,
    );
  });
  exec = jest.spyOn(childProcess, "exec").mockImplementation(() => {
    throw new Error(`Security alert! Do not use exec(), use spawn() instead`);
  });
});

afterEach(() => {
  expect(execSync).not.toHaveBeenCalled();
  expect(exec).not.toHaveBeenCalled();
});

afterAll(() => {
  jest.restoreAllMocks();
});

export function createEmptyArgs(): UploadOverrides {
  return {
    build: undefined,
    branch: undefined,
    parent: undefined,
    pr: undefined,
    sha: undefined,
    slug: undefined,
    url: undefined,
  };
}
