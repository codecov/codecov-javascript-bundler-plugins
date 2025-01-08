/**
 * Copied and modified from:
 * https://github.com/getsentry/sentry-javascript-bundler-plugins/blob/main/packages/bundler-plugin-core/src/sentry/telemetry.ts
 */
import {
  Scope,
  ServerRuntimeClient,
  type ServerRuntimeClientOptions,
  createStackParser,
  nodeStackLineParser,
  type Client,
  startSpan,
} from "@sentry/core";
import { type UnpluginOptions } from "unplugin";
import { type NormalizedOptions } from "../utils/normalizeOptions";
import { makeOptionallyEnabledNodeTransport } from "./transports";
import { cyan } from "../utils/logging";

const stackParser = createStackParser(nodeStackLineParser());

interface CreateSentryInstanceOptions {
  telemetry: boolean;
  isDryRun: boolean;
  pluginName: string;
  pluginVersion: string;
  options?: NormalizedOptions;
  bundler: string;
  metaFramework?: string;
}

export function createSentryInstance({
  telemetry,
  isDryRun,
  pluginName,
  pluginVersion,
  options,
  bundler,
  metaFramework,
}: CreateSentryInstanceOptions): {
  sentryScope: Scope;
  sentryClient: Client;
} {
  // setting to 0 will ensure that no data is sent
  let sampleRate = 0;
  let tracesSampleRate = 0;
  // just being really explicit here as to what we're checking for
  // currently we're not tracking dry runs as they're more for debugging, and
  // are not interacting with our systems - up for debate whether we want to
  // keep this
  if (telemetry === true && isDryRun === false) {
    sampleRate = 1;
    tracesSampleRate = 1;
  }

  const clientOptions: ServerRuntimeClientOptions = {
    platform: "node",
    runtime: { name: "node", version: global.process.version },

    dsn: "https://942e283ea612c29cc3371c6d27f57e58@o26192.ingest.us.sentry.io/4506739665207296",

    tracesSampleRate,
    sampleRate,

    release: pluginVersion,
    integrations: [],
    tracePropagationTargets: ["api.codecov.io"],

    stackParser,

    beforeSend: (event) => {
      event.exception?.values?.forEach((exception) => {
        // Stack track may have some PII
        delete exception.stacktrace;
      });

      delete event.server_name; // Server name might contain PII
      return event;
    },

    beforeSendTransaction: (event) => {
      delete event.server_name; // Server name might contain PII
      return event;
    },

    // We create a transport that stalls sending events until we know that we're allowed to
    transport: makeOptionallyEnabledNodeTransport(telemetry),
  };

  const client = new ServerRuntimeClient(clientOptions);
  const scope = new Scope();
  scope.setClient(client);

  if (options) {
    setTelemetryDataOnScope(
      options,
      { name: pluginName, version: pluginVersion },
      scope,
      bundler,
      metaFramework,
    );
  }

  return { sentryScope: scope, sentryClient: client };
}

interface PluginInfo {
  name: string;
  version: string;
}

export function setTelemetryDataOnScope(
  options: NormalizedOptions,
  pluginInfo: PluginInfo,
  scope: Scope,
  bundler: string,
  metaFramework?: string,
) {
  // some general information about where the plugins are being ram
  scope.setTag("node", process.version);
  scope.setTag("platform", process.platform);

  // determine which plugin and it's version that's being used
  scope.setTag("plugin.name", pluginInfo.name);
  scope.setTag("plugin.version", pluginInfo.version);

  // determine the method of authorization
  let authMode = options.dryRun ? "dry-run" : "tokenless";
  if (options.uploadToken && options.uploadToken !== "") {
    authMode = "token";
  } else if (options.oidc?.useGitHubOIDC) {
    authMode = "github-oidc";
  }
  scope.setTag("auth_mode", authMode);

  // determine what git services are being used to auth with tokenless
  if (options.gitService) {
    scope.setTag("git_service", options.gitService);
  }

  // want to see if we're mainly running in ci envs compared to local builds
  scope.setTag("ci", !!process.env.CI);

  // track which bundlers and meta-frameworks are being used
  scope.setTag("meta_framework", metaFramework ?? "none");
  scope.setTag("bundler", bundler);
}

/** Flushing the SDK client can fail. We never want to crash the plugin because of telemetry. */
export async function safeFlushTelemetry(sentryClient: Client) {
  try {
    await sentryClient.flush(2000);
  } catch {
    // Noop when flushing fails.
    // We don't even need to log anything because there's likely nothing the user can do and they likely will not care.
  }
}

interface TelemetryPluginOptions {
  sentryClient: Client;
  sentryScope: Scope;
  telemetry: boolean;
}

export function telemetryPlugin({
  sentryClient,
  sentryScope,
  telemetry,
}: TelemetryPluginOptions): UnpluginOptions {
  return {
    name: "codecov-telemetry-plugin",
    async buildStart() {
      if (telemetry) {
        cyan(
          "Sending telemetry data on issues and performance to Codecov. To disable telemetry, set `options.telemetry` to `false`.",
        );
        startSpan(
          {
            name: "Codecov Bundler Plugin Execution",
            op: "bundler-plugin-execution",
            scope: sentryScope,
          },
          () => {
            //
          },
        );
        await safeFlushTelemetry(sentryClient);
      }
    },
  };
}
