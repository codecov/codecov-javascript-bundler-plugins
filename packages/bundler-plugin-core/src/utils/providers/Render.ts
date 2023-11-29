import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.RENDER);
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

  return args?.branch ?? envs?.RENDER_GIT_BRANCH ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "render";
}

export function getServiceName(): string {
  return "Render";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.RENDER_GIT_COMMIT ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.RENDER_GIT_REPO_SLUG ?? "";
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
    "RENDER",
    "IS_PULL_REQUEST",
    "RENDER_DISCOVERY_SERVICE",
    "RENDER_EXTERNAL_HOSTNAME",
    "RENDER_EXTERNAL_URL",
    "RENDER_GIT_BRANCH",
    "RENDER_GIT_COMMIT",
    "RENDER_GIT_REPO_SLUG",
    "RENDER_INSTANCE_ID",
    "RENDER_SERVICE_ID",
    "RENDER_SERVICE_NAME",
    "RENDER_SERVICE_TYPE",
  ];
}
