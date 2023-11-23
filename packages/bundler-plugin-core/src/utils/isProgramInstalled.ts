import childprocess from "child_process";

export function isProgramInstalled(programName: string): boolean {
  return !childprocess.spawnSync(programName).error;
}
