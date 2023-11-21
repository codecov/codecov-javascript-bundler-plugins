import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.TEAMCITY_VERSION);
}

function _getBuildURL(): string {
  return "";
}

// This is the value that gets passed to the Codecov uploader
function _getService(): string {
  return "teamcity";
}

// This is the name that gets printed
export function getServiceName(): string {
  return "TeamCity";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.BRANCH_NAME ?? "";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.BUILD_VCS_NUMBER ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return parseSlugFromRemoteAddr("") ?? "";
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.BUILD_NUMBER ?? "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getJob(): string {
  return "";
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
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return ["TEAMCITY_VERSION"];
}
