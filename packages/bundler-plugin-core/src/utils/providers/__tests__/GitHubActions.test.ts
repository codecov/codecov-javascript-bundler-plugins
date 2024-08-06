import * as GitHub from "@actions/github";
import { createEmptyArgs } from "@test-utils/helpers.ts";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import { Output } from "../../Output.ts";
import * as GitHubActions from "../GitHubActions.ts";

const server = setupServer();

const mocks = vi.hoisted(() => ({
  eventName: vi.fn().mockReturnValue(""),
}));

vi.mock("@actions/github", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import("@actions/github")>();
  return original;
});

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
});

afterAll(() => {
  server.close();
});

describe("GitHub Actions Params", () => {
  function setup(
    {
      data = {},
      eventName = "",
    }: {
      data?: object;
      eventName?: "" | "pull_request" | "pull_request_target";
    } = { data: {}, eventName: "" },
  ) {
    mocks.eventName.mockReturnValue(eventName);
    vi.mocked(GitHub).context = {
      eventName,
      payload: {
        // @ts-expect-error - forcing the payload to be a PullRequestEvent
        pull_request: {
          head: {
            sha: "test-head-sha",
          },
          base: {
            sha: "test-base-sha",
          },
        },
      },
    };

    server.use(
      http.get(
        "https://api.github.com/repos/:org/:repo/actions/runs/:id/jobs",
        () => {
          return HttpResponse.json(data, { status: 200 });
        },
      ),
    );
  }

  describe("detect()", () => {
    it("does not run without GitHub Actions env variable", () => {
      setup({});
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          GITHUB_REF: "refs/heads/master",
          GITHUB_REPOSITORY: "testOrg/testRepo",
          GITHUB_RUN_ID: "2",
          GITHUB_SHA: "test-head-sha",
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
    setup({ eventName: "" });
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_REF: "refs/heads/master",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "test-head-sha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
    };

    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "test-head-sha",
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
    setup({ eventName: "pull_request" });
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_HEAD_REF: "branch",
        GITHUB_REF: "refs/pull/1/merge",
        GITHUB_REPOSITORY: "testOrg/testRepo",
        GITHUB_RUN_ID: "2",
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_SHA: "test-head-sha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
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

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "test-head-sha",
      compareSha: "test-base-sha",
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets correct buildURL for a PR", async () => {
    setup({
      data: {
        jobs: [
          {
            id: 1,
            name: "fakeJob",
            html_url: "https://fake.com",
          },
          {
            id: 2,
            name: "seocondFakeJob",
            html_url:
              "https://github.com/testOrg/testRepo/actions/runs/2/jobs/2",
          },
          {
            id: 3,
            name: "anotherFakeJob",
            html_url: "https://example.com",
          },
        ],
      },
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
        GITHUB_SHA: "test-head-sha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
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

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2",
      commit: "test-head-sha",
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
      data: {
        jobs: [
          {
            id: 1,
            name: "fakeJob",
            html_url: "https://fake.com",
          },
          {
            id: 2,
            name: "testJob",
            html_url:
              "https://github.com/testOrg/testRepo/actions/runs/2/jobs/2",
          },
          {
            id: 3,
            name: "anotherFakeJob",
            html_url: "https://example.com",
          },
        ],
      },
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
        GITHUB_SHA: "test-head-sha",
        GITHUB_WORKFLOW: "testWorkflow",
      },
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

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "2",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/2/jobs/2",
      commit: "test-head-sha",
      compareSha: null,
      job: "testWorkflow",
      pr: "1",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for a merge", async () => {
    setup({ eventName: "pull_request" });
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
      commit: "test-head-sha",
      compareSha: "test-base-sha",
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
          sha: "test-head-sha",
          compareSha: "test-base-sha",
          slug: "testOrg/testRepo",
        },
      },
      envs: {
        GITHUB_ACTIONS: "true",
        GITHUB_SERVER_URL: "https://github.com",
      },
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

    const expected: ProviderServiceParams = {
      branch: "branch",
      build: "3",
      buildURL: "https://github.com/testOrg/testRepo/actions/runs/3",
      commit: "test-head-sha",
      compareSha: "test-base-sha",
      job: null,
      pr: "2",
      service: "github-actions",
      slug: "testOrg/testRepo",
    };
    expect(params).toMatchObject(expected);
  });
});
