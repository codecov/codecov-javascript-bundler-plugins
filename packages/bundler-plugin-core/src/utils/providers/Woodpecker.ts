import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return envs?.CI === "woodpecker";
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
  const build = envs?.CI_BUILD_NUMBER ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  const buildURL = envs?.CI_BUILD_LINK ?? null;
  debug(`Using buildURL: ${buildURL}`, { enabled: output.debug });
  return buildURL;
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
  const branch =
    envs?.CI_COMMIT_SOURCE_BRANCH ?? envs?.CI_COMMIT_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["job"] {
  const { envs } = inputs;
  const job = envs?.CI_JOB_NUMBER ?? null;
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
  const pr = envs?.CI_COMMIT_PULL_REQUEST ?? null;
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
}

function _getService(): ProviderServiceParams["service"] {
  return "woodpecker";
}

export function getServiceName(): string {
  return "Woodpecker CI";
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
  const sha = envs?.CI_COMMIT_SHA ?? null;
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
  const slug = envs?.CI_REPO ?? null;
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
    buildURL: _getBuildURL(inputs, output),
    commit: _getSHA(inputs, output),
    pr: _getPR(inputs, output),
    job: _getJob(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
  };
}

export function getEnvVarNames() {
  return [
    "CI",
    "CI_BUILD_NUMBER",
    "CI_BUILD_LINK",
    "CI_COMMIT_SOURCE_BRANCH",
    "CI_COMMIT_BRANCH",
    "CI_JOB_NUMBER",
    "CI_COMMIT_PULL_REQUEST",
    "CI_COMMIT_SHA",
    "CI_COMMIT_TAG",
    "CI_REPO",
  ];
}
