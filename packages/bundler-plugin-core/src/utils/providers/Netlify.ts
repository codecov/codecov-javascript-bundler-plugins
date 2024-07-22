import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.NETLIFY);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BUILD_ID ?? null;
}

function _getBuildURL(): ProviderServiceParams["buildURL"] {
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args?.branch;
  }
  return envs?.BRANCH ?? null;
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args } = inputs;
  return args?.pr ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "netlify";
}

export function getServiceName(): string {
  return "Netlify";
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

  const sha = envs?.COMMIT_REF ?? null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
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
