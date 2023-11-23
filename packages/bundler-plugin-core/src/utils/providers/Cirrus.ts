import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CIRRUS_CI);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.CIRRUS_BUILD_ID ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.CIRRUS_BRANCH ?? "";
}

function _getJob(envs: ProviderEnvs): string {
  return envs?.CIRRUS_TASK_ID ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.CIRRUS_PR ?? "";
}

function _getService(): string {
  return "cirrus-ci";
}

export function getServiceName(): string {
  return "Cirrus CI";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.CIRRUS_CHANGE_IN_REPO ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return setSlug(args?.slug, envs?.CIRRUS_REPO_OWNER, envs?.CIRRUS_REPO_NAME);
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: ProviderUtilInputs,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["CIRRUS_CI"];
}
