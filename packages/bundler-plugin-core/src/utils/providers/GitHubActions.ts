import {
  type UploadUtilEnvs,
  type UploadUtilServiceParams,
  type UploaderUtilInputs,
} from "~/types.ts";
import { runExternalProgram } from "../runExternalProgram.ts";

export function detect(envs: UploadUtilEnvs): boolean {
  return Boolean(envs?.GITHUB_ACTIONS);
}

function _getBuild(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  return args?.build ?? envs?.GITHUB_RUN_ID ?? "";
}

async function _getJobURL(inputs: UploaderUtilInputs): Promise<string> {
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

  const data = await res.json();
  const { envs } = inputs;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  for (const job of (data as any)?.jobs) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (job?.name == envs?.GITHUB_JOB) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return job?.html_url;
    }
  }
  return "";
}

async function _getBuildURL(inputs: UploaderUtilInputs): Promise<string> {
  const { envs } = inputs;

  const url = await _getJobURL(inputs);
  if (url !== "") {
    return url;
  }
  return `${envs?.GITHUB_SERVER_URL}/${_getSlug(
    inputs,
  )}/actions/runs/${_getBuild(inputs)}`;
}

function _getBranch(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  const branchRegex = /refs\/heads\/(.*)/;
  const branchMatches = branchRegex.exec(envs?.GITHUB_REF ?? "");
  let branch;
  if (branchMatches) {
    branch = branchMatches[1];
  }

  if (envs?.GITHUB_HEAD_REF && envs?.GITHUB_HEAD_REF !== "") {
    branch = envs?.GITHUB_HEAD_REF;
  }
  return args?.branch ?? branch ?? "";
}

function _getJob(envs: UploadUtilEnvs): string {
  return envs?.GITHUB_WORKFLOW ?? "";
}

function _getPR(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  let match;
  if (envs?.GITHUB_HEAD_REF && envs?.GITHUB_HEAD_REF !== "") {
    const prRegex = /refs\/pull\/([0-9]+)\/merge/;
    const matches = prRegex.exec(envs?.GITHUB_REF ?? "");
    if (matches) {
      match = matches[1];
    }
  }
  return args?.pr ?? match ?? "";
}

function _getService(): string {
  return "github-actions";
}

export function getServiceName(): string {
  return "GitHub Actions";
}

function _getSHA(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.sha && args?.sha !== "") return args.sha;

  const pr = _getPR(inputs);

  let commit = envs?.GITHUB_SHA;
  if (pr) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/;
    const mergeCommitMessage = runExternalProgram("git", [
      "show",
      "--no-patch",
      "--format=%P",
    ]);

    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const mergeCommit = mergeCommitMessage.split(" ")[1];

      commit = mergeCommit;
    } else if (mergeCommitMessage === "") {
    }
  }

  return args?.sha ?? commit ?? "";
}

function _getSlug(inputs: UploaderUtilInputs): string {
  const { args, envs } = inputs;
  if (args?.slug && args?.slug !== "") return args?.slug;
  return envs?.GITHUB_REPOSITORY ?? "";
}

export async function getServiceParams(
  inputs: UploaderUtilInputs,
): Promise<UploadUtilServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: await _getBuildURL(inputs),
    commit: _getSHA(inputs),
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
