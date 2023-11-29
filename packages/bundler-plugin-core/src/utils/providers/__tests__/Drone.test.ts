import td from "testdouble";

import { createEmptyArgs } from "@test-utils/helpers.ts";
import {
  type ProviderServiceParams,
  type ProviderUtilInputs,
} from "../../../types.ts";
import * as Drone from "../Drone.ts";

describe("Drone Params", () => {
  afterEach(() => {
    td.reset();
  });

  describe("detect()", () => {
    it("does not run without Drone env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      };
      const detected = Drone.detect(inputs.envs);
      expect(detected).toBeFalsy();
    });

    it("does run with Drone env variable", () => {
      const inputs: ProviderUtilInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: "true",
          DRONE: "true",
        },
      };
      const detected = Drone.detect(inputs.envs);
      expect(detected).toBeTruthy();
    });
  });

  it("gets correct params", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        DRONE: "true",
        DRONE_BRANCH: "master",
        DRONE_COMMIT_SHA: "testingsha",
        DRONE_BUILD_NUMBER: "2",
        DRONE_PULL_REQUEST: "1",
        DRONE_BUILD_LINK: "https://www.drone.io/",
        DRONE_REPO: "testOrg/testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "https://www.drone.io/",
      commit: "testingsha",
      job: "",
      pr: "1",
      service: "drone.io",
      slug: "testOrg/testRepo",
    };
    const params = await Drone.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });

  it("gets correct params for DRONE_BUILD_URL", async () => {
    const inputs: ProviderUtilInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: "true",
        DRONE: "true",
        DRONE_BRANCH: "master",
        DRONE_COMMIT_SHA: "testingsha",
        DRONE_BUILD_NUMBER: "2",
        DRONE_PULL_REQUEST: "1",
        DRONE_BUILD_URL: "https://www.drone.io/",
        DRONE_REPO: "testOrg/testRepo",
      },
    };
    const expected: ProviderServiceParams = {
      branch: "master",
      build: "2",
      buildURL: "https://www.drone.io/",
      commit: "testingsha",
      job: "",
      pr: "1",
      service: "drone.io",
      slug: "testOrg/testRepo",
    };
    const params = await Drone.getServiceParams(inputs);
    expect(params).toMatchObject(expected);
  });
});
