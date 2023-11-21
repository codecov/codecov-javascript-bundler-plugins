import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.DRONE);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.DRONE_BUILD_NUMBER ?? "";
}

function _getBuildURL(inputs: UploaderUtilInputs): string {
  const { envs } = inputs;
  return (
    envs?.DRONE_BUILD_LINK ?? envs?.DRONE_BUILD_URL ?? envs?.CI_BUILD_URL ?? ""
  );
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.DRONE_BRANCH ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.DRONE_PULL_REQUEST ?? "";
}

function _getService(): string {
  return "drone.io";
}

export function getServiceName(): string {
  return "Drone";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.DRONE_COMMIT_SHA ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.DRONE_REPO ?? "";
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: UploaderUtilInputs,
): Promise<UploadUtilServiceParams> {
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
