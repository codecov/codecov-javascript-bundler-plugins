import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CF_PAGES);
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

  return args?.branch ?? envs?.CF_PAGES_BRANCH ?? "";
}

function _getJob(): string {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "cloudflare-pages";
}

export function getServiceName(): string {
  return "Cloudflare Pages";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.CF_PAGES_COMMIT_SHA ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return "";
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
  return ["CF_PAGES", "CF_PAGES_COMMIT_SHA", "CF_PAGES_BRANCH", "CF_PAGES_URL"];
}
