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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }
  const build = envs?.BUILD_ID ?? null;
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
    return args?.branch;
  }
  const branch = envs?.BRANCH ?? null;
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
    return args?.pr;
  }
  debug(`Using pr: ${null}`, { enabled: output.debug });
  return null;
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

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args } = inputs;
  if (args?.slug && args.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }
  debug(`Using slug: ${null}`, { enabled: output.debug });
  return null;
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
