import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CF_PAGES);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args } = inputs;
  return args?.build ?? null;
}

function _getBuildURL() {
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return envs?.CF_PAGES_BRANCH ?? null;
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args } = inputs;
  return args?.pr ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "cloudflare-pages";
}

export function getServiceName(): string {
  return "Cloudflare Pages";
}

function _getSHA(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["commit"] {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args.sha}`, { enabled: output.debug });
    return args.sha;
  }

  debug(`Using commit: ${envs?.CF_PAGES_COMMIT_SHA ?? ""}`, {
    enabled: output.debug,
  });
  return envs?.CF_PAGES_COMMIT_SHA ?? null;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args } = inputs;
  return args?.slug ?? null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs, output),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames() {
  return ["CF_PAGES", "CF_PAGES_COMMIT_SHA", "CF_PAGES_BRANCH", "CF_PAGES_URL"];
}
