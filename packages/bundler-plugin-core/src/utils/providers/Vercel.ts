import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.VERCEL);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  return args?.build ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args } = inputs;

  return args?.branch ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "vercel";
}

export function getServiceName(): string {
  return "Vercel";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.VERCEL_GIT_COMMIT_SHA ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.VERCEL_GIT_REPO_SLUG ?? "";
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
    "VERCEL",
    "CI",
    "VERCEL_ENV",
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_REGION",
    "VERCEL_AUTOMATION_BYPASS_SECRET",
    "VERCEL_GIT_PROVIDER",
    "VERCEL_GIT_REPO_SLUG",
    "VERCEL_GIT_REPO_OWNER",
    "VERCEL_GIT_REPO_ID",
    "VERCEL_GIT_COMMIT_REF",
    "VERCEL_GIT_COMMIT_SHA",
    "VERCEL_GIT_COMMIT_MESSAGE",
    "VERCEL_GIT_COMMIT_AUTHOR_NAME",
    "VERCEL_GIT_PREVIOUS_SHA",
    "VERCEL_GIT_PULL_REQUEST_ID",
  ];
}
