import { jsonSchema } from "../../schemas.ts";
import {
  type ProviderEnvs,
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../types.ts";
import { type Output } from "../Output.ts";
import { debug } from "../logging.ts";
import { runExternalProgram } from "../runExternalProgram.ts";

export function detect(envs: ProviderEnvs): boolean {
  return Boolean(envs?.GITHUB_ACTIONS);
}

function _getBuild(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.build && args.build !== "") {
    return args.build;
  }
  return envs?.GITHUB_RUN_ID ?? "";
}

async function _getJobURL(inputs: ProviderUtilInputs): Promise<string> {
  const url = `https://api.github.com/repos/${_getSlug(
    inputs,
  )}/actions/runs/${_getBuild(inputs)}/jobs`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Awesome-Octocat-App",
    },
  });
  if (res.status !== 200) {
    return "";
  }

  const rawJson = await res.json();
  const data = jsonSchema.parse(rawJson);
  const { envs } = inputs;

  if (
    data &&
    typeof data === "object" &&
    "jobs" in data &&
    Array.isArray(data?.jobs)
  ) {
    for (const job of data?.jobs) {
      if (
        job &&
        typeof job === "object" &&
        "name" in job &&
        job?.name == envs?.GITHUB_JOB &&
        "html_url" in job &&
        typeof job?.html_url === "string"
      ) {
        return job?.html_url;
      }
    }
  }

  return "";
}

async function _getBuildURL(inputs: ProviderUtilInputs): Promise<string> {
  const { envs } = inputs;

  const url = await _getJobURL(inputs);
  if (url !== "") {
    return url;
  }
  return `${envs?.GITHUB_SERVER_URL}/${_getSlug(
    inputs,
  )}/actions/runs/${_getBuild(inputs)}`;
}

function _getBranch(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.branch && args.branch !== "") {
    return args.branch;
  }

  const branchRegex = /refs\/heads\/(.*)/;
  const branchMatches = branchRegex.exec(envs?.GITHUB_REF ?? "");
  let branch;
  if (branchMatches) {
    branch = branchMatches[1];
  }

  if (envs?.GITHUB_HEAD_REF && envs?.GITHUB_HEAD_REF !== "") {
    branch = envs?.GITHUB_HEAD_REF;
  }
  return branch ?? "";
}

function _getJob(envs: ProviderEnvs): string {
  return envs?.GITHUB_WORKFLOW ?? "";
}

function _getPR(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.pr && args.pr !== "") {
    return args.pr;
  }

  let match;
  if (envs?.GITHUB_HEAD_REF && envs?.GITHUB_HEAD_REF !== "") {
    const prRegex = /refs\/pull\/([0-9]+)\/merge/;
    const matches = prRegex.exec(envs?.GITHUB_REF ?? "");
    if (matches) {
      match = matches[1];
    }
  }
  return match ?? "";
}

function _getService(): string {
  return "github-actions";
}

export function getServiceName(): string {
  return "GitHub Actions";
}

function _getSHA(inputs: ProviderUtilInputs, output: Output): string {
  const { args, envs } = inputs;
  if (args?.sha && args.sha !== "") {
    debug(`Using commit: ${args.sha}`, { enabled: output.debug });
    return args.sha;
  }

  const pr = _getPR(inputs);

  let commit = envs?.GITHUB_SHA;
  if (pr) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/;
    const mergeCommitMessage = runExternalProgram("git", [
      "show",
      "--no-patch",
      "--format=%P",
    ]);

    debug(`Merge commit message: ${mergeCommitMessage}`, {
      enabled: output.debug,
    });

    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const splitMergeCommit = mergeCommitMessage.split(" ");

      debug(`Split commit message: ${splitMergeCommit}`, {
        enabled: output.debug,
      });

      commit = splitMergeCommit[1];
    }
  }

  debug(`Using commit: ${commit ?? ""}`, { enabled: output.debug });

  return commit ?? "";
}

function _getSlug(inputs: ProviderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args.slug !== "") {
    return args.slug;
  }
  return envs?.GITHUB_REPOSITORY ?? "";
}

export async function getServiceParams(
  inputs: ProviderUtilInputs,
  output: Output,
): Promise<ProviderServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: await _getBuildURL(inputs),
    commit: _getSHA(inputs, output),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  };
}

export function getEnvVarNames(): string[] {
  return [
    "GITHUB_ACTION",
    "GITHUB_HEAD_REF",
    "GITHUB_REF",
    "GITHUB_REPOSITORY",
    "GITHUB_RUN_ID",
    "GITHUB_SERVER_URL",
    "GITHUB_SHA",
    "GITHUB_WORKFLOW",
  ];
}
