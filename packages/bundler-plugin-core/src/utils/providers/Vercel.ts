// VERCEL ENV DOCS
// https://vercel.com/docs/projects/environment-variables/system-environment-variables

import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.VERCEL);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.build ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;

  return args?.branch ?? envs.VERCEL_GIT_COMMIT_REF ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "vercel";
}

export function getServiceName(): string {
  return "Vercel";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.VERCEL_GIT_COMMIT_SHA ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  const owner = envs?.VERCEL_GIT_REPO_OWNER ?? "";
  const repo = envs?.VERCEL_GIT_REPO_SLUG ?? "";

  let slug = "";
  if (owner && repo) {
    slug = `${owner}/${repo}`;
  }

  return slug;
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
