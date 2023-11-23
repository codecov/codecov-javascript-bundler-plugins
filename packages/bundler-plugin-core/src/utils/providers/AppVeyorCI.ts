import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";

export function detect(envs: ProviderEnvs): boolean {
  return (
    (envs?.CI === "true" || envs?.CI === "True") &&
    (envs?.APPVEYOR === "true" || envs?.APPVEYOR === "True")
  );
}

function _getBuild(inputs: ProviderUtilInputs) {
  const { args, envs } = inputs;
  return args?.build ?? envs?.APPVEYOR_JOB_ID ?? "";
}

function _getBuildURL(inputs: ProviderUtilInputs) {
  const { envs } = inputs;
  if (
    envs?.APPVEYOR_URL &&
    envs?.APPVEYOR_REPO_NAME &&
    envs?.APPVEYOR_BUILD_ID &&
    envs?.APPVEYOR_JOB_ID
  ) {
    return `${envs?.APPVEYOR_URL}/project/${envs?.APPVEYOR_REPO_NAME}/builds/${envs?.APPVEYOR_BUILD_ID}/job/${envs?.APPVEYOR_JOB_ID}`;
  }
  return "";
}

function _getBranch(inputs: ProviderUtilInputs) {
  const { args, envs } = inputs;
  if (args?.branch && args?.branch !== "") {
    return args?.branch;
  }

  return envs?.APPVEYOR_REPO_BRANCH ?? "";
}

function _getJob(envs: ProviderEnvs) {
  if (
    envs?.APPVEYOR_ACCOUNT_NAME &&
    envs?.APPVEYOR_PROJECT_SLUG &&
    envs?.APPVEYOR_BUILD_VERSION
  ) {
    return `${envs?.APPVEYOR_ACCOUNT_NAME}/${envs?.APPVEYOR_PROJECT_SLUG}/${envs?.APPVEYOR_BUILD_VERSION}`;
  }
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.APPVEYOR_PULL_REQUEST_NUMBER ?? "";
}

function _getService() {
  return "appveyor";
}

export function getServiceName(): string {
  return "Appveyor CI";
}

function _getSHA(inputs: ProviderUtilInputs) {
  const { args, envs } = inputs;
  return (
    args?.sha ??
    envs?.APPVEYOR_PULL_REQUEST_HEAD_COMMIT ??
    envs?.APPVEYOR_REPO_COMMIT ??
    ""
  );
}

function _getSlug(inputs: ProviderUtilInputs) {
  const { args, envs } = inputs;
  return args?.slug ?? envs?.APPVEYOR_REPO_NAME ?? "";
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return [
    "APPVEYOR",
    "APPVEYOR_ACCOUNT_NAME",
    "APPVEYOR_BUILD_ID",
    "APPVEYOR_BUILD_VERSION",
    "APPVEYOR_JOB_ID",
    "APPVEYOR_PROJECT_SLUG",
    "APPVEYOR_PULL_REQUEST_HEAD_COMMIT",
    "APPVEYOR_PULL_REQUEST_NUMBER",
    "APPVEYOR_REPO_BRANCH",
    "APPVEYOR_REPO_COMMIT",
    "APPVEYOR_REPO_NAME",
    "APPVEYOR_URL",
    "CI",
  ];
}
