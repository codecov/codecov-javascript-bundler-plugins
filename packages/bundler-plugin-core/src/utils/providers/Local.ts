import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { parseSlug } from "../git.ts";
import { isProgramInstalled } from "../isProgramInstalled.ts";
import { debug } from "../logging.ts";
import { runExternalProgram } from "../runExternalProgram.ts";

// This provider requires git to be installed
export function detect(): boolean {
  return isProgramInstalled("git");
}

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args } = inputs;
  let build: string | null = null;
  if (args?.build && args?.build !== "") {
    build = args.build;
  }
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
  const branch = args?.branch ?? envs?.GIT_BRANCH ?? envs?.BRANCH_NAME ?? null;
  if (branch !== "" && branch !== null) {
    debug(`Using branch: ${branch}`, { enabled: output.debug });
    return branch;
  }

  try {
    const branchName = runExternalProgram("git", [
      "rev-parse",
      "--abbrev-ref",
      "HEAD",
    ]);
    debug(`Using branch: ${branchName}`, { enabled: output.debug });
    return branchName;
  } catch (error) {
    throw new Error(
      `There was an error getting the branch name from git: ${error}`,
    );
  }
}

function _getJob(output: Output): ProviderServiceParams["job"] {
  debug(`Using job: ${null}`, { enabled: output.debug });
  return null;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args } = inputs;
  let pr: string | null = null;
  if (args?.pr && args?.pr !== "") {
    pr = args.pr;
  }
  debug(`Using pr: ${pr}`, { enabled: output.debug });
  return pr;
}

// This is the value that gets passed to the Codecov uploader
function _getService(): ProviderServiceParams["service"] {
  return "local";
}

// This is the name that gets printed
export function getServiceName(): string {
  return "Local";
}

function _getSHA(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["commit"] {
  const { args, envs } = inputs;
  const sha = args?.sha ?? envs?.GIT_COMMIT ?? null;
  if (sha !== "" && sha !== null) {
    debug(`Using commit: ${sha}`, { enabled: output.debug });
    return sha;
  }

  try {
    const sha = runExternalProgram("git", ["rev-parse", "HEAD"]);
    debug(`Using commit: ${sha}`, { enabled: output.debug });
    return sha;
  } catch (error) {
    throw new Error(
      `There was an error getting the commit SHA from git: ${error}`,
    );
  }
}

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args } = inputs;
  if (args?.slug && args?.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }

  try {
    const slug = runExternalProgram("git", [
      "config",
      "--get",
      "remote.origin.url",
    ]);

    const parsedSlug = parseSlug(slug);
    debug(`Using slug: ${parsedSlug}`, { enabled: output.debug });
    return parsedSlug;
  } catch (error) {
    throw new Error(`There was an error getting the slug from git: ${error}`);
  }
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
    job: _getJob(output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
  };
}

export function getEnvVarNames() {
  return ["BRANCH_NAME", "CI", "GIT_BRANCH", "GIT_COMMIT"];
}
