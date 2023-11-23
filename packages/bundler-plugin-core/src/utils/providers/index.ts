import { type ProviderUtil } from "@/types.ts";

import * as AppVeyorCI from "./AppVeyorCI.ts";
import * as AzurePipelines from "./AzurePipelines.ts";
import * as Bitbucket from "./Bitbucket.ts";
import * as Bitrise from "./Bitrise.ts";
import * as Buildkite from "./Buildkite.ts";
import * as CircleCI from "./CircleCI.ts";
import * as Cirrus from "./Cirrus.ts";
import * as CloudflarePages from "./CloudflarePages.ts";
import * as CodeBuild from "./CodeBuild.ts";
import * as Drone from "./Drone.ts";
import * as GitHubActions from "./GitHubActions.ts";
import * as GitLabCI from "./GitLabCI.ts";
import * as HerokuCI from "./HerokuCI.ts";
import * as JenkinsCI from "./JenkinsCI.ts";
import * as Local from "./Local.ts";
import * as Netlify from "./Netlify.ts";
import * as Render from "./Render.ts";
import * as TeamCity from "./TeamCity.ts";
import * as TravisCI from "./TravisCI.ts";
import * as Vercel from "./Vercel.ts";
import * as Wercker from "./Wercker.ts";
import * as Woodpecker from "./Woodpecker.ts";

// Please make sure provider_local is last
export const providerList: ProviderUtil[] = [
  AppVeyorCI,
  AzurePipelines,
  Bitbucket,
  Bitrise,
  Buildkite,
  CircleCI,
  Cirrus,
  CloudflarePages,
  CodeBuild,
  Drone,
  GitHubActions,
  GitLabCI,
  HerokuCI,
  JenkinsCI,
  Netlify,
  Render,
  TeamCity,
  TravisCI,
  Vercel,
  Wercker,
  Woodpecker,
  Local,
];
