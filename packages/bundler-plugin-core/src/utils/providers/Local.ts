import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "@/types.ts";
import { parseSlug } from "../git.ts";
import { isProgramInstalled } from "../isProgramInstalled.ts";
import { runExternalProgram } from "../runExternalProgram.ts";

// This provider requires git to be installed
export function detect(): boolean {
  return isProgramInstalled("git");
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.build ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  const branch = args?.branch ?? envs?.GIT_BRANCH ?? envs?.BRANCH_NAME ?? "";
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

function _getJob(): string {
  return "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

// This is the value that gets passed to the Codecov uploader
function _getService(): string {
  return "";
}

// This is the name that gets printed
export function getServiceName(): string {
  return "Local";
}

function _getSHA(inputs: ProviderUtilInputs) {
  const { args, envs } = inputs;
  const sha = args?.sha ?? envs?.GIT_COMMIT ?? "";
  if (sha !== "") {
    return sha;
  }

  try {
    const sha = runExternalProgram("git", ["rev-parse", "HEAD"]);
    return sha;
  } catch (error) {
    throw new Error(
      `There was an error getting the commit SHA from git: ${error}`,
    );
  }
}

function _getSlug(inputs: ProviderUtilInputs): string {
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
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["BRANCH_NAME", "CI", "GIT_BRANCH", "GIT_COMMIT"];
}
