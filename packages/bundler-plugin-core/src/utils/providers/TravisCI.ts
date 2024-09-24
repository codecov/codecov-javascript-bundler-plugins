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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }
  const build = envs?.TRAVIS_JOB_NUMBER ?? null;
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

  let branch = null;
  if (envs?.TRAVIS_BRANCH !== envs?.TRAVIS_TAG) {
    branch = envs?.TRAVIS_PULL_REQUEST_BRANCH ?? envs?.TRAVIS_BRANCH ?? null;
  }
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(
  envs: ProviderEnvs,
  output: Output,
): ProviderServiceParams["job"] {
  const job = envs?.TRAVIS_JOB_ID ?? null;
  debug(`Using job: ${job}`, { enabled: output.debug });
  return job;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    debug(`Using pr: ${args.pr}`, { enabled: output.debug });
    return args.pr;
  }
  const pr = envs?.TRAVIS_PULL_REQUEST ?? null;
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
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

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }
  const slug = envs?.TRAVIS_REPO_SLUG ?? null;
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
    job: _getJob(inputs.envs, output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
  };
}

export function getEnvVarNames() {
  return ["TRAVIS"];
}
