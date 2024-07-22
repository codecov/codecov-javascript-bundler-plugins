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

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.CI_BUILD_NUMBER ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  return envs?.CI_BUILD_LINK ?? null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }

  return envs?.CI_COMMIT_SOURCE_BRANCH ?? envs?.CI_COMMIT_BRANCH ?? null;
}

function _getJob(inputs: ProviderUtilInputs): ProviderServiceParams["job"] {
  const { envs } = inputs;
  return envs?.CI_JOB_NUMBER ?? null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.CI_COMMIT_PULL_REQUEST ?? null;
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

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.CI_REPO ?? null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs, output),
    pr: _getPR(inputs),
    job: _getJob(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
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
