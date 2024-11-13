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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }
  const build = envs?.CI_BUILD_ID ?? envs?.CI_JOB_ID ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(output: Output): ProviderServiceParams["buildURL"] {
  debug(`Using buildURL: ${null}`, { enabled: output.debug });
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    debug(`Using branch: ${args.branch}`, { enabled: output.debug });
    return args.branch;
  }
  const branch = envs?.CI_BUILD_REF_NAME ?? envs?.CI_COMMIT_REF_NAME ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(output: Output): ProviderServiceParams["job"] {
  debug(`Using job: ${null}`, { enabled: output.debug });
  return null;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args } = inputs;
  if (args?.pr && args.pr !== "") {
    debug(`Using pr: ${args.pr}`, { enabled: output.debug });
    return args.pr;
  }
  debug(`Using pr: ${null}`, { enabled: output.debug });
  return null;
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

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args?.slug;
  }

  const remoteAddr = envs?.CI_BUILD_REPO ?? envs?.CI_REPOSITORY_URL ?? "";
  const slug =
    envs?.CI_PROJECT_PATH ?? parseSlugFromRemoteAddr(remoteAddr) ?? null;
  debug(`Using slug: ${slug}`, { enabled: output.debug });
  return slug;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs, output),
    build: _getBuild(inputs, output),
    buildURL: _getBuildURL(output),
    commit: _getSHA(inputs, output),
    job: _getJob(output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
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
