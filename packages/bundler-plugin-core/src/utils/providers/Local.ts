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

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args } = inputs;
  return args?.build ?? null;
}

function _getBuildURL(): ProviderServiceParams["buildURL"] {
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  const branch = args?.branch ?? envs?.GIT_BRANCH ?? envs?.BRANCH_NAME ?? null;
  if (branch !== "") {
    return branch;
  }

  try {
    const branchName = runExternalProgram("git", [
      "rev-parse",
      "--abbrev-ref",
      "HEAD",
    ]);
    return branchName;
  } catch (error) {
    throw new Error(
      `There was an error getting the branch name from git: ${error}`,
    );
  }
}

function _getJob(): ProviderServiceParams["job"] {
  return null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args } = inputs;
  return args?.pr ?? null;
}

// This is the value that gets passed to the Codecov uploader
function _getService(): ProviderServiceParams["service"] {
  return "";
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
  if (sha !== "") {
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

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args } = inputs;
  if (args?.slug && args?.slug !== "") {
    return args.slug;
  }

  try {
    const slug = runExternalProgram("git", [
      "config",
      "--get",
      "remote.origin.url",
    ]);

    return parseSlug(slug);
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
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs, output),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames() {
  return ["BRANCH_NAME", "CI", "GIT_BRANCH", "GIT_COMMIT"];
}
