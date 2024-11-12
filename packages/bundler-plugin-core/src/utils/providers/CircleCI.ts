import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.CIRCLECI);
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

  const build = envs?.CIRCLE_BUILD_NUM ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["buildURL"] {
  const buildURL = inputs.envs?.CIRCLE_BUILD_URL ?? null;
  debug(`Using buildURL: ${buildURL}`, { enabled: output.debug });
  return buildURL;
}

// This is the value that gets passed to the Codecov uploader
function _getService(): ProviderServiceParams["service"] {
  return "circleci";
}

// This is the name that gets printed
export function getServiceName(): string {
  return "CircleCI";
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
  const branch = envs?.CIRCLE_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
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

  debug(`Using commit: ${envs?.CIRCLE_SHA1}`, { enabled: output.debug });
  return envs?.CIRCLE_SHA1 ?? null;
}

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  let slug = setSlug(
    args?.slug,
    envs?.CIRCLE_PROJECT_USERNAME,
    envs?.CIRCLE_PROJECT_REPONAME,
  );

  if (envs?.CIRCLE_REPOSITORY_URL && envs?.CIRCLE_REPOSITORY_URL !== "") {
    slug = `${envs?.CIRCLE_REPOSITORY_URL?.split(":")[1]?.split(".git")[0]}`;
  }
  debug(`Using slug: ${slug}`, { enabled: output.debug });
  return slug;
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

  const pr = envs?.CIRCLE_PR_NUMBER ?? null;
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
}

function _getJob(
  envs: ProviderEnvs,
  output: Output,
): ProviderServiceParams["job"] {
  const job = envs?.CIRCLE_NODE_INDEX ?? null;
  debug(`Using job: ${job}`, { enabled: output.debug });
  return job;
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
  return ["CI", "CIRCLECI"];
}
