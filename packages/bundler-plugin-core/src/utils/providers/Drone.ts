import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.DRONE);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.DRONE_BUILD_NUMBER ?? "";
}

function _getBuildURL(inputs: ProviderUtilInputs): string {
  const { envs } = inputs;
  return (
    envs?.DRONE_BUILD_LINK ?? envs?.DRONE_BUILD_URL ?? envs?.CI_BUILD_URL ?? ""
  );
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.DRONE_BRANCH ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.DRONE_PULL_REQUEST ?? "";
}

function _getService(): string {
  return "drone.io";
}

export function getServiceName(): string {
  return "Drone";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.DRONE_COMMIT_SHA ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.DRONE_REPO ?? "";
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
    "DRONE",
    "DRONE_BRANCH",
    "DRONE_BUILD_NUMBER",
    "DRONE_BUILD_URL",
    "DRONE_COMMIT_SHA",
    "DRONE_PULL_REQUEST",
    "DRONE_REPO",
  ];
}
