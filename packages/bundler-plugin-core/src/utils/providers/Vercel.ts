// VERCEL ENV DOCS
// https://vercel.com/docs/projects/environment-variables/system-environment-variables

import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.VERCEL);
}

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }
  debug(`Using build: ${null}`, { enabled: output.debug });
  return null;
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
  const branch = envs?.VERCEL_GIT_COMMIT_REF ?? null;
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
  return "vercel";
}

export function getServiceName(): string {
  return "Vercel";
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
  const sha = envs?.VERCEL_GIT_COMMIT_SHA ?? null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }

  let slug = null;
  const owner = envs?.VERCEL_GIT_REPO_OWNER ?? "";
  const repo = envs?.VERCEL_GIT_REPO_SLUG ?? "";
  if (owner && repo) {
    slug = `${owner}/${repo}`;
  }
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
