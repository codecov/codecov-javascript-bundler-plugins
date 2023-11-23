import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.BITRISE_IO);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.BITRISE_BUILD_NUMBER ?? "";
}

function _getBuildURL(inputs: ProviderUtilInputs): string {
  const { envs } = inputs;
  return envs?.BITRISE_BUILD_URL ?? "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.BITRISE_GIT_BRANCH ?? "";
}

function _getJob() {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.BITRISE_PULL_REQUEST ?? "";
}

function _getService(): string {
  return "bitrise";
}

export function getServiceName(): string {
  return "Bitrise CI";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.GIT_CLONE_COMMIT_HASH ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.slug ?? parseSlugFromRemoteAddr("") ?? "";
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
  return [
    "BITRISE_BUILD_NUMBER",
    "BITRISE_BUILD_URL",
    "BITRISE_GIT_BRANCH",
    "BITRISE_IO",
    "BITRISE_PULL_REQUEST",
    "CI",
    "GIT_CLONE_COMMIT_HASH",
  ];
}
