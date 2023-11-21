import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.NETLIFY);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.BUILD_ID ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;

  return args?.branch ?? envs?.BRANCH ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "netlify";
}

export function getServiceName(): string {
  return "Netlify";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.COMMIT_REF ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return "";
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: UploaderUtilInputs,
): Promise<UploadUtilServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return [
    "NETLIFY",
    "BUILD_ID",
    "REPOSITORY_URL",
    "BRANCH",
    "HEAD",
    "COMMIT_REF",
    "CACHED_COMMIT_REF",
    "PULL_REQUEST",
    "REVIEW_ID",
  ];
}
