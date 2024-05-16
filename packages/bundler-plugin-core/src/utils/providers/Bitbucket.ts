import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { runExternalProgram } from "../runExternalProgram.ts";
import { validateSHA } from "../validate.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.BITBUCKET_BUILD_NUMBER);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BITBUCKET_BUILD_NUMBER ?? "";
}

function _getBuildURL(): string {
  // TODO: https://github.com/codecov/uploader/issues/267
  return "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.branch && args?.branch !== "") {
    return args?.branch;
  }
  return envs?.BITBUCKET_BRANCH ?? "";
}

function _getJob(envs: ProviderEnvs): string {
  return envs?.BITBUCKET_BUILD_NUMBER ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.BITBUCKET_PR_ID ?? "";
}

function _getService(): string {
  return "bitbucket";
}

export function getServiceName(): string {
  return "Bitbucket";
}

function _getSHA(inputs: ProviderUtilInputs, output: Output): string {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args.sha}`, { enabled: output.debug });
    return args.sha;
  }

  let commit = envs.BITBUCKET_COMMIT ?? "";
  if (commit && validateSHA(commit, 12)) {
    commit = runExternalProgram("git", ["rev-parse", commit]);
  }

  if (output.debug) {
    debug(`Using commit: ${commit ?? ""}`);
  }

  return commit ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.BITBUCKET_REPO_FULL_NAME ?? "";
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

export function getEnvVarNames(): string[] {
  return ["CI", "BITBUCKET_BUILD_NUMBER"];
}
