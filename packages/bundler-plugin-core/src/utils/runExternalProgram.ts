import childprocess from "child_process";
import { SPAWN_PROCESS_BUFFER_SIZE } from "./constants.ts";

export function runExternalProgram(
  programName: string,
  optionalArguments: string[] = [],
): string {
  const result = childprocess.spawnSync(programName, optionalArguments, {
    maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
  });

  if (result.error) {
    throw new Error(`Error running external program: ${result.error}`);
  }
  return result.stdout.toString().trim();
}
