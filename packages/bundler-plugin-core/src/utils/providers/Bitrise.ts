import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.BITRISE_IO);
}

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  const build = envs?.BITRISE_BUILD_NUMBER ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  const buildURL = envs?.BITRISE_BUILD_URL ?? null;
  debug(`Using buildURL: ${buildURL}`, { enabled: output.debug });
  return buildURL;
}

function _getBranch(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  const branch = envs?.BITRISE_GIT_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(output: Output): ProviderServiceParams["job"] {
  debug(`Using job: ${null}`, { enabled: output.debug });
  return null;
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
  const pr = envs?.BITRISE_PULL_REQUEST ?? null;
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
}

function _getService(): ProviderServiceParams["service"] {
  return "bitrise";
}

export function getServiceName(): string {
  return "Bitrise CI";
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

  debug(`Using commit: ${envs?.GIT_CLONE_COMMIT_HASH ?? ""}`, {
    enabled: output.debug,
  });

  return envs?.GIT_CLONE_COMMIT_HASH ?? null;
}

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args } = inputs;
  if (args?.slug && args.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }
  const slug = parseSlugFromRemoteAddr("") ?? null;
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
    job: _getJob(output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
  };
}

export function getEnvVarNames() {
  return [
    "BITRISE_BUILD_NUMBER",
    "BITRISE_BUILD_URL",
    "BITRISE_GIT_BRANCH",
    "BITRISE_IO",
    "BITRISE_PULL_REQUEST",
    "CI",
    "GIT_CLONE_COMMIT_HASH",
  ];
}
