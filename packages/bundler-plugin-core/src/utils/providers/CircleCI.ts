import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.CIRCLECI);
}

function _getBuildURL(inputs: ProviderUtilInputs): string {
  return inputs.envs?.CIRCLE_BUILD_URL ?? "";
}

// This is the value that gets passed to the Codecov uploader
function _getService(): string {
  return "circleci";
}

// This is the name that gets printed
export function getServiceName(): string {
  return "CircleCI";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }

  return envs?.CIRCLE_BRANCH ?? "";
}

function _getSHA(inputs: ProviderUtilInputs, output: Output): string {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args.sha}`, { enabled: output.debug });
    return args.sha;
  }

  debug(`Using commit: ${envs?.CIRCLE_SHA1}`, { enabled: output.debug });
  return envs?.CIRCLE_SHA1 ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  const slug = setSlug(
    args?.slug,
    envs?.CIRCLE_PROJECT_USERNAME,
    envs?.CIRCLE_PROJECT_REPONAME,
  );

  if (envs?.CIRCLE_REPOSITORY_URL && envs?.CIRCLE_REPOSITORY_URL !== "") {
    return `${envs?.CIRCLE_REPOSITORY_URL?.split(":")[1]?.split(".git")[0]}`;
  }
  return slug;
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }

  return envs?.CIRCLE_BUILD_NUM ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }

  return envs?.CIRCLE_PR_NUMBER ?? "";
}

function _getJob(envs: ProviderEnvs): string {
  return envs?.CIRCLE_NODE_INDEX ?? "";
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["CI", "CIRCLECI"];
}
