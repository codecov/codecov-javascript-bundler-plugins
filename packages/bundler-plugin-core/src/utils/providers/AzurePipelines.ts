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

function _getBuild(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["build"] {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    debug(`Using build: ${args.build}`, { enabled: output.debug });
    return args.build;
  }

  const build = envs?.BUILD_BUILDNUMBER ?? null;
  debug(`Using build: ${build}`, { enabled: output.debug });
  return build;
}

function _getBuildURL(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["buildURL"] {
  const { envs } = inputs;
  let buildURL: string | null = null;
  if (envs?.SYSTEM_TEAMPROJECT && envs?.BUILD_BUILDID) {
    buildURL = `${envs?.SYSTEM_TEAMFOUNDATIONSERVERURI}${envs?.SYSTEM_TEAMPROJECT}/_build/results?buildId=${envs?.BUILD_BUILDID}`;
  }
  debug(`Using build URL: ${buildURL}`, { enabled: output.debug });
  return buildURL;
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

  let branch: string | null = null;
  if (envs?.BUILD_SOURCEBRANCH) {
    branch = envs?.BUILD_SOURCEBRANCH.toString().replace("refs/heads/", "");
  }

  debug(`Using branch: ${branch}`, { enabled: output.debug });
  return branch;
}

function _getJob(
  envs: ProviderEnvs,
  output: Output,
): ProviderServiceParams["job"] {
  const job = envs?.BUILD_BUILDID ?? null;
  debug(`Using job: ${job}`, { enabled: output.debug });
  return job;
}

function _getPR(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["pr"] {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    debug(`Using PR: ${args.pr}`, { enabled: output.debug });
    return args.pr;
  }

  const pr =
    envs?.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER ??
    envs?.SYSTEM_PULLREQUEST_PULLREQUESTID ??
    null;
  debug(`Using PR: ${pr}`, { enabled: output.debug });
  return pr;
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
  const skip_merge_commit_from_pr = Boolean(envs?.SYSTEM_SKIP_MERGE_COMMIT_FROM_PR);

  if (!skip_merge_commit_from_pr && _getPR(inputs, output)) {
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

  debug(`Using commit: ${commit}`, { enabled: output.debug });
  return commit;
}

function _getSlug(
  inputs: ProviderUtilInputs,
  output: Output,
): ProviderServiceParams["slug"] {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    debug(`Using slug: ${args.slug}`, { enabled: output.debug });
    return args.slug;
  }

  const slug =
    envs?.BUILD_REPOSITORY_NAME ?? parseSlugFromRemoteAddr("") ?? null;
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
    buildURL: _getBuildURL(inputs, output),
    commit: _getSHA(inputs, output),
    job: _getJob(inputs.envs, output),
    pr: _getPR(inputs, output),
    service: _getService(),
    slug: _getSlug(inputs, output),
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
