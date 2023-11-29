import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";

export function detect(envs: ProviderEnvs): boolean {
  return (
    Boolean(envs?.CI) &&
    Boolean(envs?.TRAVIS) &&
    Boolean(envs?.SHIPPABLE) === false
  );
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.TRAVIS_JOB_NUMBER ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;

  let branch = "";
  if (envs?.TRAVIS_BRANCH !== envs?.TRAVIS_TAG) {
    branch = envs?.TRAVIS_PULL_REQUEST_BRANCH ?? envs?.TRAVIS_BRANCH ?? "";
  }
  return args?.branch ?? branch;
}

function _getJob(envs: ProviderEnvs): string {
  return envs?.TRAVIS_JOB_ID ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.TRAVIS_PULL_REQUEST ?? "";
}

function _getService(): string {
  return "travis";
}

export function getServiceName(): string {
  return "Travis CI";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return (
    args?.sha ?? envs?.TRAVIS_PULL_REQUEST_SHA ?? envs?.TRAVIS_COMMIT ?? ""
  );
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.TRAVIS_REPO_SLUG ?? "";
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["TRAVIS"];
}
