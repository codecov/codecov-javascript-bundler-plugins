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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }

  const build = envs?.APPVEYOR_BUILD_ID ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });

  return build;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  let buildUrl: string | null = null;

  if (
    envs?.APPVEYOR_URL &&
    envs?.APPVEYOR_REPO_NAME &&
    envs?.APPVEYOR_BUILD_ID &&
    envs?.APPVEYOR_JOB_ID
  ) {
    buildUrl = `${envs?.APPVEYOR_URL}/project/${envs?.APPVEYOR_REPO_NAME}/builds/${envs?.APPVEYOR_BUILD_ID}/job/${envs?.APPVEYOR_JOB_ID}`;
  }

  debug(`Using build URL: ${buildUrl}`, { enabled: output.debug });
  return buildUrl;
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
  const branch = envs?.APPVEYOR_REPO_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(
  envs: ProviderEnvs,
  output: Output,
): ProviderServiceParams["job"] {
  let job: string | null = null;

  if (
    envs?.APPVEYOR_ACCOUNT_NAME &&
    envs?.APPVEYOR_PROJECT_SLUG &&
    envs?.APPVEYOR_BUILD_VERSION
  ) {
    job = `${envs.APPVEYOR_ACCOUNT_NAME}/${envs.APPVEYOR_PROJECT_SLUG}/${envs.APPVEYOR_BUILD_VERSION}`;
  }

  debug(`Using job: ${job}`, { enabled: output.debug });
  return job;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    debug(`Using PR number: ${args.pr}`, { enabled: output.debug });
    return args.pr;
  }

  const pr = envs?.APPVEYOR_PULL_REQUEST_NUMBER ?? null;
  debug(`Using PR number: ${pr}`, { enabled: output.debug });
  return pr;
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

  debug(`Using commit: ${commitSha}`, { enabled: output.debug });

  return commitSha ?? null;
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

  const slug = envs?.APPVEYOR_REPO_NAME ?? null;
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
    job: _getJob(inputs.envs, output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
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
