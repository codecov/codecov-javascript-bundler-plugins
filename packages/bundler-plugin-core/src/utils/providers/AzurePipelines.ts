import childProcess from "child_process";
import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { parseSlugFromRemoteAddr } from "../git.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.SYSTEM_TEAMFOUNDATIONSERVERURI);
}

function _getBuild(inputs: ProviderUtilInputs): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.BUILD_BUILDNUMBER ?? null;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  if (envs?.SYSTEM_TEAMPROJECT && envs?.BUILD_BUILDID) {
    return `${envs?.SYSTEM_TEAMFOUNDATIONSERVERURI}${envs?.SYSTEM_TEAMPROJECT}/_build/results?buildId=${envs?.BUILD_BUILDID}`;
  }
  return null;
}

function _getBranch(
  inputs: ProviderUtilInputs,
): ProviderServiceParams["branch"] {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }

  if (envs?.BUILD_SOURCEBRANCH) {
    return envs?.BUILD_SOURCEBRANCH.toString().replace("refs/heads/", "");
  }

  return null;
}

function _getJob(envs: ProviderEnvs): ProviderServiceParams["job"] {
  return envs?.BUILD_BUILDID ?? null;
}

function _getPR(inputs: ProviderUtilInputs): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }

  return (
    envs?.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER ??
    envs?.SYSTEM_PULLREQUEST_PULLREQUESTID ??
    null
  );
}

function _getService(): ProviderServiceParams["service"] {
  return "azure_pipelines";
}

export function getServiceName(): string {
  return "Azure Pipelines";
}

function _getSHA(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["commit"] {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args?.sha}`, {
      enabled: output.debug,
    });
    return args.sha;
  }

  let commit = envs?.BUILD_SOURCEVERSION ?? null;

  if (_getPR(inputs)) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/;
    const mergeCommitMessage = childProcess
      .execFileSync("git", ["show", "--no-patch", "--format=%P"])
      .toString()
      .trimEnd();

    debug(`Merge commit message: ${mergeCommitMessage}`, {
      enabled: output.debug,
    });

    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const splitMergeCommit = mergeCommitMessage.split(" ");
      debug(`Split merge commit: ${splitMergeCommit}`, {
        enabled: output.debug,
      });

      commit = splitMergeCommit?.[1] ?? "";
    }
  }

  debug(`Using commit: ${commit}`, {
    enabled: output.debug,
  });

  return commit;
}

function _getSlug(inputs: ProviderUtilInputs): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }

  return envs?.BUILD_REPOSITORY_NAME ?? parseSlugFromRemoteAddr("") ?? null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServiceParams(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs, output),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames() {
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
