import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.BUILDKITE);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BUILDKITE_BUILD_NUMBER ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  return inputs.envs?.BUILDKITE_BUILD_URL ?? null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return envs?.BUILDKITE_BRANCH ?? null;
}

function _getJob(envs: ProviderEnvs): ProviderServiceParams["job"] {
  return envs?.BUILDKITE_JOB_ID ?? null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args } = inputs;
  return args?.pr ?? null;
}

export function _getService(): ProviderServiceParams["service"] {
  return "buildkite";
}

export function getServiceName(): string {
  return "Buildkite";
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

  debug(`Using commit: ${args?.sha ?? envs?.BUILDKITE_COMMIT}`, {
    enabled: output.debug,
  });
  return envs?.BUILDKITE_COMMIT ?? null;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  return setSlug(
    args?.slug,
    envs?.BUILDKITE_ORGANIZATION_SLUG,
    envs?.BUILDKITE_PIPELINE_SLUG,
  );
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

export function getEnvVarNames() {
  return [
    "BUILDKITE",
    "BUILDKITE_BRANCH",
    "BUILDKITE_BUILD_NUMBER",
    "BUILDKITE_BUILD_URL",
    "BUILDKITE_COMMIT",
    "BUILDKITE_JOB_ID",
    "BUILDKITE_PROJECT_SLUG",
  ];
}
