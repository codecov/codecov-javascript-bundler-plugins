import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.WERCKER_MAIN_PIPELINE_STARTED);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.WERCKER_MAIN_PIPELINE_STARTED ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  return envs?.WERCKER_BUILD_URL ?? null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return envs?.WERCKER_GIT_BRANCH ?? null;
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args } = inputs;
  return args?.pr ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "wercker";
}

export function getServiceName(): string {
  return "Wercker CI";
}

function _getSHA(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["commit"] {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args.sha}`, { enabled: output.debug });
    return args.sha;
  }
  const sha = envs?.WERCKER_GIT_COMMIT ?? null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  return setSlug(
    args?.slug,
    envs?.WERCKER_GIT_OWNER,
    envs?.WERCKER_GIT_REPOSITORY,
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs, output),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames() {
  return ["WERCKER_MAIN_PIPELINE_STARTED"];
}
