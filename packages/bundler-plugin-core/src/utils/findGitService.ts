import { runExternalProgram } from "./runExternalProgram.ts";

const GIT_SERVICES = [
  "github",
  "gitlab",
  "bitbucket",
  "github_enterprise",
  "gitlab_enterprise",
  "bitbucket_server",
] as const;

/**
 * Possible cases we're considering:
 *  - https://github.com/codecov/codecov-cli.git returns github
 *  - git@github.com:codecov/codecov-cli.git returns github
 *  - ssh://git@github.com/gitcodecov/codecov-cli returns github
 *  - ssh://git@github.com:gitcodecov/codecov-cli returns github
 *  - https://user-name@bitbucket.org/namespace-codecov/first_repo.git returns bitbucket
 * Copied from: https://github.com/codecov/codecov-cli/blob/main/codecov_cli/helpers/git.py#L72-L91
 */

export const findGitService = () => {
  const remotes = runExternalProgram("git", ["remote"]).split("\n");

  const remoteName =
    remotes.find((remote) => remote.includes("origin")) ?? remotes?.[0];

  if (!remoteName) {
    throw new Error("No remote found");
  }

  const remoteService = runExternalProgram("git", [
    "ls-remote",
    "--get-url",
    remoteName,
  ]).trim();

  return parseGitService(remoteService);
};

export const parseGitService = (gitService: string) => {
  const service = gitService.startsWith("git@")
    ? splitPath(gitService)
    : findGitServiceFromURL(gitService);

  if (GIT_SERVICES.includes(service)) {
    return service;
  }
  return;
};

const findGitServiceFromURL = (gitService: string) => {
  try {
    const parsedURL = new URL(gitService);
    return splitPath(gitService.replace(`${parsedURL.protocol}//`, ""));
  } catch {
    // empty
  }

  return "";
};

export const splitPath = (path: string) => {
  if (path.includes("@")) {
    path = path.split("@", 2)[1] ?? path;
  }

  if (path.includes(":")) {
    path = path.split(":", 1)[0] ?? path;
  }

  if (path.includes(".")) {
    path = path.split(".", 1)[0] ?? path;
  }
  return path;
};
