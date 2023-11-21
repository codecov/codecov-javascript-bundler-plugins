import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.CI) && Boolean(envs?.HEROKU_TEST_RUN_BRANCH);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.HEROKU_TEST_RUN_ID ?? "";
}

function _getBuildURL(): string {
  return "";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.branch ?? envs?.HEROKU_TEST_RUN_BRANCH ?? "";
}

function _getJob() {
  return "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  return args?.pr ?? "";
}

function _getService(): string {
  return "heroku";
}

export function getServiceName(): string {
  return "Heroku CI";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.sha ?? envs?.HEROKU_TEST_RUN_COMMIT_VERSION ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args } = inputs;
  if (args?.slug && args.slug !== "") return args?.slug;
  return parseSlugFromRemoteAddr("") ?? "";
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
  return [
    "CI",
    "HEROKU_TEST_RUN_BRANCH",
    "HEROKU_TEST_RUN_COMMIT_VERSION",
    "HEROKU_TEST_RUN_ID",
  ];
}
