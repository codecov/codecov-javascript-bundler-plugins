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

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.CI_BUILD_NUMBER ?? "";
}

function _getBuildURL(inputs: ProviderUtilInputs): string {
  const { envs } = inputs;
  return envs?.CI_BUILD_LINK ?? "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }

  return envs?.CI_COMMIT_SOURCE_BRANCH ?? envs?.CI_COMMIT_BRANCH ?? "";
}

function _getJob(inputs: ProviderUtilInputs): string {
  const { envs } = inputs;
  return envs?.CI_JOB_NUMBER ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.CI_COMMIT_PULL_REQUEST ?? "";
}

function _getService(): string {
  return "woodpecker";
}

export function getServiceName(): string {
  return "Woodpecker CI";
}

function _getSHA(inputs: ProviderUtilInputs, output: Output): string {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args.sha}`, { enabled: output.debug });
    return args.sha;
  }
  const sha = envs?.CI_COMMIT_SHA ?? "";
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.CI_REPO ?? "";
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

export function getEnvVarNames(): string[] {
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
