import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.WERCKER_MAIN_PIPELINE_STARTED);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.WERCKER_MAIN_PIPELINE_STARTED ?? "";
}

function _getBuildURL(inputs: ProviderUtilInputs): string {
  const { envs } = inputs;
  return envs?.WERCKER_BUILD_URL ?? "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;

  return args?.branch ?? envs?.WERCKER_GIT_BRANCH ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "wercker";
}

export function getServiceName(): string {
  return "Wercker CI";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.WERCKER_GIT_COMMIT ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
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
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["WERCKER_MAIN_PIPELINE_STARTED"];
}
