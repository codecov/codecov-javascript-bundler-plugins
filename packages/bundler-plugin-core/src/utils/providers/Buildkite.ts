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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }
  const build = envs?.BUILDKITE_BUILD_NUMBER ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  const buildURL = envs?.BUILDKITE_BUILD_URL ?? null;
  debug(`Using buildURL: ${buildURL}`, { enabled: output.debug });
  return buildURL;
}

function _getBranch(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    debug(`Using branch: ${args.branch}`, { enabled: output.debug });
    return args.branch;
  }

  const branch = envs?.BUILDKITE_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["job"] {
  const { envs } = inputs;
  const job = envs?.BUILDKITE_JOB_ID ?? null;
  debug(`Using job: ${job}`, { enabled: output.debug });
  return job;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args } = inputs;
  const pr = args?.pr ?? null;
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
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

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  const slug = setSlug(
    args?.slug,
    envs?.BUILDKITE_ORGANIZATION_SLUG,
    envs?.BUILDKITE_PIPELINE_SLUG,
  );
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
    job: _getJob(inputs, output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
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
