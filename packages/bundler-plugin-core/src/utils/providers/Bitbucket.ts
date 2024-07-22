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

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BITBUCKET_BUILD_NUMBER ?? null;
}

function _getBuildURL(): ProviderServiceParams["buildURL"] {
  // TODO: https://github.com/codecov/uploader/issues/267
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args?.branch !== "") {
    return args?.branch;
  }
  return envs?.BITBUCKET_BRANCH ?? null;
}

function _getJob(envs: ProviderEnvs): ProviderServiceParams["job"] {
  return envs?.BITBUCKET_BUILD_NUMBER ?? null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.BITBUCKET_PR_ID ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "bitbucket";
}

export function getServiceName(): string {
  return "Bitbucket";
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

  let commit = envs.BITBUCKET_COMMIT ?? "";
  if (commit && validateSHA(commit, 12)) {
    commit = runExternalProgram("git", ["rev-parse", commit]);
  }

  debug(`Using commit: ${commit ?? ""}`, { enabled: output.debug });
  return commit ?? null;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.BITBUCKET_REPO_FULL_NAME ?? null;
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
  return ["CI", "BITBUCKET_BUILD_NUMBER"];
}
