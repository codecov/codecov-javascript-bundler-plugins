import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.BUILDKITE);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.BUILDKITE_BUILD_NUMBER ?? "";
}

function _getBuildURL(inputs: ProviderUtilInputs): string {
  return inputs.envs?.BUILDKITE_BUILD_URL ?? "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.BUILDKITE_BRANCH ?? "";
}

function _getJob(envs: ProviderEnvs): string {
  return envs?.BUILDKITE_JOB_ID ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

export function _getService(): string {
  return "buildkite";
}

export function getServiceName(): string {
  return "Buildkite";
}

function _getSHA(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (Boolean(args?.sha) || Boolean(envs?.BUILDKITE_COMMIT)) {
    return args?.sha ?? envs?.BUILDKITE_COMMIT ?? "";
  }

  throw new Error("Unable to detect sha, please set manually with the -C flag");
}

function _getSlug(inputs: ProviderUtilInputs): string {
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
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
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
