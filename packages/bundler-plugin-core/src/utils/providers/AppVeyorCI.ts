import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return (
    (envs?.CI === "true" || envs?.CI === "True") &&
    (envs?.APPVEYOR === "true" || envs?.APPVEYOR === "True")
  );
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.APPVEYOR_JOB_ID ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  if (
    envs?.APPVEYOR_URL &&
    envs?.APPVEYOR_REPO_NAME &&
    envs?.APPVEYOR_BUILD_ID &&
    envs?.APPVEYOR_JOB_ID
  ) {
    return `${envs?.APPVEYOR_URL}/project/${envs?.APPVEYOR_REPO_NAME}/builds/${envs?.APPVEYOR_BUILD_ID}/job/${envs?.APPVEYOR_JOB_ID}`;
  }
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }
  return envs?.APPVEYOR_REPO_BRANCH ?? null;
}

function _getJob(envs: ProviderEnvs): ProviderServiceParams["job"] {
  if (
    envs?.APPVEYOR_ACCOUNT_NAME &&
    envs?.APPVEYOR_PROJECT_SLUG &&
    envs?.APPVEYOR_BUILD_VERSION
  ) {
    return `${envs?.APPVEYOR_ACCOUNT_NAME}/${envs?.APPVEYOR_PROJECT_SLUG}/${envs?.APPVEYOR_BUILD_VERSION}`;
  }
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }
  return envs?.APPVEYOR_PULL_REQUEST_NUMBER ?? null;
}

function _getService(): ProviderServiceParams["service"] {
  return "appveyor";
}

export function getServiceName(): string {
  return "Appveyor CI";
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

  const commitSha =
    envs?.APPVEYOR_PULL_REQUEST_HEAD_COMMIT ?? envs?.APPVEYOR_REPO_COMMIT;

  debug(`Using commit: ${commitSha ?? ""}`, {
    enabled: output.debug,
  });

  return commitSha ?? null;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.APPVEYOR_REPO_NAME ?? null;
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
    "APPVEYOR",
    "APPVEYOR_ACCOUNT_NAME",
    "APPVEYOR_BUILD_ID",
    "APPVEYOR_BUILD_VERSION",
    "APPVEYOR_JOB_ID",
    "APPVEYOR_PROJECT_SLUG",
    "APPVEYOR_PULL_REQUEST_HEAD_COMMIT",
    "APPVEYOR_PULL_REQUEST_NUMBER",
    "APPVEYOR_REPO_BRANCH",
    "APPVEYOR_REPO_COMMIT",
    "APPVEYOR_REPO_NAME",
    "APPVEYOR_URL",
    "CI",
  ];
}
