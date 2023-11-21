import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.CODEBUILD_CI);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.CODEBUILD_BUILD_ID ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return (
    args?.branch ??
    (envs?.CODEBUILD_WEBHOOK_HEAD_REF
      ? envs?.CODEBUILD_WEBHOOK_HEAD_REF.replace(/^refs\/heads\//, "")
      : "")
  );
}

function _getJob(envs: UploadUtilEnvs): string {
  return envs?.CODEBUILD_BUILD_ID ?? "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return (
    args?.pr ??
    (envs?.CODEBUILD_SOURCE_VERSION &&
    envs?.CODEBUILD_SOURCE_VERSION.startsWith("pr/")
      ? envs?.CODEBUILD_SOURCE_VERSION.replace(/^pr\//, "")
      : "")
  );
}

function _getService(): string {
  return "codebuild";
}

export function getServiceName(): string {
  return "AWS CodeBuild";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.CODEBUILD_RESOLVED_SOURCE_VERSION ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.CODEBUILD_SOURCE_REPO_URL
    ? envs?.CODEBUILD_SOURCE_REPO_URL.toString()
        .replace(/^.*github.com\//, "") // lgtm [js/incomplete-hostname-regexp] - We want this to match all subdomains.
        .replace(/\.git$/, "")
    : "";
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return [
    "CODEBUILD_BUILD_ID",
    "CODEBUILD_CI",
    "CODEBUILD_RESOLVED_SOURCE_VERSION",
    "CODEBUILD_SOURCE_REPO_URL",
    "CODEBUILD_SOURCE_VERSION",
    "CODEBUILD_WEBHOOK_HEAD_REF",
  ];
}
