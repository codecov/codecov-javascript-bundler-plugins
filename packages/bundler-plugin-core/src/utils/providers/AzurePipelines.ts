import childProcess from "child_process";
import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.SYSTEM_TEAMFOUNDATIONSERVERURI);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.BUILD_BUILDNUMBER ?? "";
}

function _getBuildURL(inputs: UploaderUtilInputs): string {
  const { envs } = inputs;
  if (envs?.SYSTEM_TEAMPROJECT && envs?.BUILD_BUILDID) {
    return `${envs?.SYSTEM_TEAMFOUNDATIONSERVERURI}${envs?.SYSTEM_TEAMPROJECT}/_build/results?buildId=${envs?.BUILD_BUILDID}`;
  }
  return "";
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  let branch = "";
  if (envs?.BUILD_SOURCEBRANCH) {
    branch = envs?.BUILD_SOURCEBRANCH.toString().replace("refs/heads/", "");
  }
  return args?.branch ?? branch;
}

function _getJob(envs: UploadUtilEnvs): string {
  return envs?.BUILD_BUILDID ?? "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return (
    args?.pr ??
    envs?.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER ??
    envs?.SYSTEM_PULLREQUEST_PULLREQUESTID ??
    ""
  );
}

function _getService(): string {
  return "azure_pipelines";
}

export function getServiceName(): string {
  return "Azure Pipelines";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  let commit = envs?.BUILD_SOURCEVERSION ?? "";

  if (_getPR(inputs)) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/;
    const mergeCommitMessage = childProcess
      .execFileSync("git", ["show", "--no-patch", "--format=%P"])
      .toString()
      .trimEnd();
    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const mergeCommit = mergeCommitMessage.split(" ")[1];
      commit = mergeCommit ?? "";
    }
  }

  return args?.sha ?? commit ?? "";
}

function _getProject(inputs: UploaderUtilInputs): string {
  const { envs } = inputs;
  return envs?.SYSTEM_TEAMPROJECT ?? "";
}

function _getServerURI(inputs: UploaderUtilInputs): string {
  const { envs } = inputs;
  return envs?.SYSTEM_TEAMFOUNDATIONSERVERURI ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.BUILD_REPOSITORY_NAME ?? parseSlugFromRemoteAddr("") ?? "";
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: UploaderUtilInputs,
): Promise<UploadUtilServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    project: _getProject(inputs),
    server_uri: _getServerURI(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return [
    "BUILD_BUILDID",
    "BUILD_BUILDNUMBER",
    "BUILD_SOURCEBRANCH",
    "BUILD_SOURCEVERSION",
    "SYSTEM_PULLREQUEST_PULLREQUESTID",
    "SYSTEM_PULLREQUEST_PULLREQUESTNUMBER",
    "SYSTEM_TEAMFOUNDATIONSERVERURI",
    "SYSTEM_TEAMPROJECT",
  ];
}
