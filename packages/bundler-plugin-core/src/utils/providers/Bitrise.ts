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

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BITRISE_BUILD_NUMBER ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  return envs?.BITRISE_BUILD_URL ?? null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return envs?.BITRISE_GIT_BRANCH ?? null;
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.BITRISE_PULL_REQUEST ?? null;
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

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return parseSlugFromRemoteAddr("") ?? null;
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
    "BITRISE_BUILD_NUMBER",
    "BITRISE_BUILD_URL",
    "BITRISE_GIT_BRANCH",
    "BITRISE_IO",
    "BITRISE_PULL_REQUEST",
    "CI",
    "GIT_CLONE_COMMIT_HASH",
  ];
}
