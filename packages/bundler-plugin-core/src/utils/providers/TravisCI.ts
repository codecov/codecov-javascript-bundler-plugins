import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return (
    Boolean(envs?.CI) &&
    Boolean(envs?.TRAVIS) &&
    Boolean(envs?.SHIPPABLE) === false
  );
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.TRAVIS_JOB_NUMBER ?? null;
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

  let branch = null;
  if (envs?.TRAVIS_BRANCH !== envs?.TRAVIS_TAG) {
    branch = envs?.TRAVIS_PULL_REQUEST_BRANCH ?? envs?.TRAVIS_BRANCH ?? null;
  }
  return branch;
}

function _getJob(envs: ProviderEnvs): ProviderServiceParams["job"] {
  return envs?.TRAVIS_JOB_ID ?? null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.TRAVIS_PULL_REQUEST ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "travis";
}

export function getServiceName(): string {
  return "Travis CI";
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
  const sha = envs?.TRAVIS_PULL_REQUEST_SHA ?? envs?.TRAVIS_COMMIT ?? null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.TRAVIS_REPO_SLUG ?? null;
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames() {
  return ["TRAVIS"];
}
