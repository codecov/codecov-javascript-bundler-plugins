import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { setSlug } from "../provider.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.CIRRUS_CI);
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
  const build = envs?.CIRRUS_BUILD_ID ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(output: Output): ProviderServiceParams["buildURL"] {
  debug(`Using buildURL: ${null}`, { enabled: output.debug });
  return null;
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
  const branch = envs?.CIRRUS_BRANCH ?? null;
  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(envs: ProviderEnvs): ProviderServiceParams["job"] {
  return envs?.CIRRUS_TASK_ID ?? null;
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
  const pr = envs?.CIRRUS_PR ?? null;
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
}

function _getService(): ProviderServiceParams["service"] {
  return "cirrus-ci";
}

export function getServiceName(): string {
  return "Cirrus CI";
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
  const sha = envs?.CIRRUS_CHANGE_IN_REPO ?? null;
  debug(`Using commit: ${sha}`, { enabled: output.debug });
  return sha;
}

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  const slug = setSlug(
    args?.slug,
    envs?.CIRRUS_REPO_OWNER,
    envs?.CIRRUS_REPO_NAME,
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
    buildURL: _getBuildURL(output),
    commit: _getSHA(inputs, output),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
  };
}

export function getEnvVarNames() {
  return ["CIRRUS_CI"];
}
