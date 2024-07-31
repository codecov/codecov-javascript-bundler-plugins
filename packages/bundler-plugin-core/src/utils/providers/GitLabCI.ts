import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.GITLAB_CI);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.CI_BUILD_ID ?? envs?.CI_JOB_ID ?? null;
}

function _getBuildURL(): ProviderServiceParams["buildURL"] {
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return envs?.CI_BUILD_REF_NAME ?? envs?.CI_COMMIT_REF_NAME ?? null;
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args } = inputs;
  return args?.pr ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "gitlab";
}

export function getServiceName(): string {
  return "GitLab CI";
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

  const sha =
    envs?.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA ??
    envs?.CI_BUILD_REF ??
    envs?.CI_COMMIT_SHA ??
    null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") {
    return args?.slug;
  }
  const remoteAddr = envs?.CI_BUILD_REPO ?? envs?.CI_REPOSITORY_URL ?? "";
  return envs?.CI_PROJECT_PATH ?? parseSlugFromRemoteAddr(remoteAddr) ?? null;
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
    "CI_BUILD_ID",
    "CI_BUILD_REF",
    "CI_BUILD_REF_NAME",
    "CI_BUILD_REPO",
    "CI_COMMIT_REF_NAME",
    "CI_COMMIT_SHA",
    "CI_JOB_ID",
    "CI_MERGE_REQUEST_SOURCE_BRANCH_SHA",
    "CI_PROJECT_PATH",
    "CI_REPOSITORY_URL",
    "GITLAB_CI",
  ];
}
