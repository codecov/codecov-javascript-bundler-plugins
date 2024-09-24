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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }
  const build = envs?.BITBUCKET_BUILD_NUMBER ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(output: Output): ProviderServiceParams["buildURL"] {
  // TODO: https://github.com/codecov/uploader/issues/267
  debug(`Using buildURL: ${null}`, { enabled: output.debug });
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args?.branch !== "") {
    debug(`Using branch: ${args?.branch}`, { enabled: output.debug });
    return args?.branch;
  }
  const branch = envs?.BITBUCKET_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(
  envs: ProviderEnvs,
  output: Output,
): ProviderServiceParams["job"] {
  const job = envs?.BITBUCKET_BUILD_NUMBER ?? null;
  debug(`Using job: ${job}`, { enabled: output.debug });
  return job;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    debug(`Using PR: ${args.pr}`, { enabled: output.debug });
    return args.pr;
  }
  const pr = envs?.BITBUCKET_PR_ID ?? null;
  debug(`Using PR: ${pr}`, { enabled: output.debug });
  return pr;
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

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }
  const slug = envs?.BITBUCKET_REPO_FULL_NAME ?? null;
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
  return ["CI", "BITBUCKET_BUILD_NUMBER"];
}
