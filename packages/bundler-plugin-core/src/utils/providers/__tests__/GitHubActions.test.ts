import { createEmptyArgs } from "@test-utils/helpers.ts";
import childProcess from "child_process";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import * as td from "testdouble";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { SPAWN_PROCESS_BUFFER_SIZE } from "../../constants.ts";
import { Output } from "../../Output.ts";
import * as GitHubActions from "../GitHubActions.ts";

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("GitHub Actions Params", () => {
  function setup(data: object) {
    server.use(
      http.get(
        "https://api.github.com/repos/:org/:repo/actions/runs/:id/jobs",
        () => {
          return HttpResponse.json(data, { status: 200 });
        },
      ),
    );
  }

  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without GitHub Actions env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          GITHUB_REF: "refs/heads/master",
          GITHUB_REPOSITORY: "testOrg/testRepo",
          GITHUB_RUN_ID: "2",
          GITHUB_SHA: "testingsha",
          GITHUB_WORKFLOW: "testWorkflow",
        },
      };
      const detected = GitHubActions.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does not run with only the GitHub Actions env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          GITHUB_ACTIONS: "true",
        },
      };
      const detected = GitHubActions.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params for a push event", async () => {
    setup({});
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_REF: "refs/heads/master",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "testingsha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "testingsha",
      compareSha: null,
      job: "testWorkflow",
      pr: null,
      service: "github-actions",
      slug: "testOrg/testRepo",
    };

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for a PR", async () => {
    setup({});
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_HEAD_REF: "branch",
        GITHUB_REF: "refs/pull/1/merge",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "testingsha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["show", "--no-patch", "--format=%P"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from("testingsha"),
    });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "testingsha",
      compareSha: null,
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets correct buildURL for a PR", async () => {
    setup({
      jobs: [
        {
          id: 1,
          name: "fakeJob",
          html_url: "https://fake.com",
        },
        {
          id: 2,
          name: "seocondFakeJob",
          html_url: "https://github.com/testOrg/testRepo/actions/runs/2/jobs/2",
        },
        {
          id: 3,
          name: "anotherFakeJob",
          html_url: "https://example.com",
        },
      ],
    });

    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_HEAD_REF: "branch",
        GITHUB_JOB: "testJob",
        GITHUB_REF: "refs/pull/1/merge",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "testingsha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["show", "--no-patch", "--format=%P"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from("testingsha"),
    });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "testingsha",
      compareSha: null,
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets correct buildURL by default for a PR", async () => {
    setup({
      jobs: [
        {
          id: 1,
          name: "fakeJob",
          html_url: "https://fake.com",
        },
        {
          id: 2,
          name: "testJob",
          html_url: "https://github.com/testOrg/testRepo/actions/runs/2/jobs/2",
        },
        {
          id: 3,
          name: "anotherFakeJob",
          html_url: "https://example.com",
        },
      ],
    });
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_HEAD_REF: "branch",
        GITHUB_JOB: "testJob",
        GITHUB_REF: "refs/pull/1/merge",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "testingsha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["show", "--no-patch", "--format=%P"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from("testingsha"),
    });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2/jobs/2",
      commit: "testingsha",
      compareSha: null,
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for a merge", async () => {
    setup({});
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_HEAD_REF: "branch",
        GITHUB_REF: "refs/pull/1/merge",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "testingmergecommitsha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["show", "--no-patch", "--format=%P"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({
      stdout: Buffer.from(
        "testingsha123456789012345678901234567890 testingmergecommitsha2345678901234567890",
      ),
    });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "testingmergecommitsha2345678901234567890",
      compareSha: "testingsha123456789012345678901234567890",
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for overrides", async () => {
    setup({});
    const inputs: ProviderUtilInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: "branch",
          build: "3",
          pr: "2",
          sha: "testsha",
          slug: "testOrg/testRepo",
        },
      },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_SERVER_URL: "https://github.com",
      },
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["show", "--no-patch", "--format=%P"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("testsha") });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/3",
      commit: "testsha",
      compareSha: null,
      job: null,
      pr: "2",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets an improper merge commit message", async () => {
    setup({});
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_HEAD_REF: "branch",
        GITHUB_REF: "refs/pull/1/merge",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "testingsha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const spawnSync = td.replace(childProcess, "spawnSync");
    td.when(
      spawnSync("git", ["show", "--no-patch", "--format=%P"], {
        maxBuffer: SPAWN_PROCESS_BUFFER_SIZE,
      }),
    ).thenReturn({ stdout: Buffer.from("") });

    const output = new Output({
      apiUrl: "http://localhost",
      bundleName: "GHA-test",
      debug: false,
      dryRun: true,
      enableBundleAnalysis: true,
      retryCount: 0,
    });
    const params = await GitHubActions.getServiceParams(inputs, output);

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "testingsha",
      compareSha: null,
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });
});
