import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";
import { runExternalProgram } from "../runExternalProgram.ts";
import { validateSHA } from "../validate.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.BITBUCKET_BUILD_NUMBER);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.BITBUCKET_BUILD_NUMBER ?? "";
}

function _getBuildURL(): string {
  // TODO: https://github.com/codecov/uploader/issues/267
  return "";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.BITBUCKET_BRANCH ?? "";
}

function _getJob(envs: UploadUtilEnvs): string {
  return envs?.BITBUCKET_BUILD_NUMBER ?? "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.pr ?? envs?.BITBUCKET_PR_ID ?? "";
}

function _getService(): string {
  return "bitbucket";
}

export function getServiceName(): string {
  return "Bitbucket";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  let commit = envs?.BITBUCKET_COMMIT ?? "";

  if (commit && validateSHA(commit, 12)) {
    commit = runExternalProgram("git", ["rev-parse", commit]);
  }

  return args?.sha ?? commit ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") return args.slug;
  return envs?.BITBUCKET_REPO_FULL_NAME ?? "";
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: UploaderUtilInputs,
): Promise<UploadUtilServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["CI", "BITBUCKET_BUILD_NUMBER"];
}
