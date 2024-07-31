import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.JENKINS_URL);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BUILD_NUMBER ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  return envs?.BUILD_URL ? envs?.BUILD_URL : null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return (
    envs?.ghprbSourceBranch ??
    envs?.CHANGE_BRANCH ??
    envs?.GIT_BRANCH ??
    envs?.BRANCH_NAME ??
    null
  );
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.ghprbPullId ?? envs?.CHANGE_ID ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "jenkins";
}

export function getServiceName(): string {
  return "Jenkins CI";
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

  // Note that the value of GIT_COMMIT may not be accurate if Jenkins
  // is merging `master` in to the working branch first. In these cases
  // there is no envvar representing the actual submitted commit
  const sha = envs?.ghprbActualCommit ?? envs?.GIT_COMMIT ?? null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args } = inputs;
  if (args?.slug && args?.slug !== "") {
    return args?.slug;
  }
  return parseSlugFromRemoteAddr("");
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
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames() {
  return [
    "BRANCH_NAME",
    "BUILD_NUMBER",
    "BUILD_URL",
    "CHANGE_ID",
    "GIT_BRANCH",
    "GIT_COMMIT",
    "JENKINS_URL",
    "ghprbActualCommit",
    "ghprbPullId",
    "ghprbSourceBranch",
  ];
}
