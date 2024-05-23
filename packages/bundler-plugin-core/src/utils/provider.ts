import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../types.ts";
import { type Output } from "./Output.ts";
import { cyan, red } from "./logging.ts";
import { providerList } from "./providers";

export async function detectProvider(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  cyan("Detecting CI provider");
  for (const provider of providerList) {
    if (provider.detect(inputs.envs)) {
      cyan(`Detected CI provider: ${provider.getServiceName()}`);
      return await provider.getServiceParams(inputs, output);
    }
  }
  red("Could not detect CI provider");
  throw new Error("Could not detect provider");
}

export function setSlug(
  slugArg: string | undefined,
  orgEnv: string | undefined,
  repoEnv: string | undefined,
) {
  if (typeof slugArg !== "undefined" && slugArg !== "") {
    return slugArg;
  }

  if (
    typeof orgEnv !== "undefined" &&
    typeof repoEnv !== "undefined" &&
    orgEnv !== "" &&
    repoEnv !== ""
  ) {
    return `${orgEnv}/${repoEnv}`;
  }

  return "";
}
