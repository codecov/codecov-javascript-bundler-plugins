import {
  defaultStackParser,
  makeNodeTransport,
  NodeClient,
  Hub,
  metrics,
} from "@sentry/node";
import { type Options } from "./types";
import { type NormalizedOptions } from "./utils/normalizeOptions";

export type SentryClient = ReturnType<
  typeof createSentryInstance
>["sentryClient"];

export const createSentryInstance = (
  options: NormalizedOptions,
  bundler: string,
) => {
  const telemetry = options.telemetry ?? true;

  if (telemetry === false || !!options.dryRun) {
    return { sentryClient: undefined, sentryHub: undefined };
  }

  const client = new NodeClient({
    dsn: "https://942e283ea612c29cc3371c6d27f57e58@o26192.ingest.sentry.io/4506739665207296",

    _experiments: {
      metricsAggregator: true,
    },

    tracesSampleRate: 1,
    sampleRate: 1,

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // @ts-expect-error this value is being replaced by rollup
    release: __PACKAGE_VERSION__ as string,
    integrations: [metrics.metricsAggregatorIntegration()],
    tracePropagationTargets: ["api.codecov.io", "stage-api.codecov.dev"],

    stackParser: defaultStackParser,

    beforeSend: (event) => {
      event.exception?.values?.forEach((exception) => {
        delete exception.stacktrace;
      });

      delete event.server_name;
      return event;
    },

    beforeSendTransaction: (event) => {
      delete event.server_name;
      return event;
    },

    transport: (nodeTransportOptions) => {
      const nodeTransport = makeNodeTransport(nodeTransportOptions);
      return {
        flush: (timeout) => nodeTransport.flush(timeout),
        send: async (request) => {
          if (telemetry) {
            return nodeTransport.send(request);
          }
          return undefined;
        },
      };
    },
  });

  const hub = new Hub(client);

  setTelemetryDataOnHub(options, hub, bundler);

  // increment the counter for the bundler
  client.metricsAggregator?.add("c", `bundler-${bundler}`, 1);

  return { sentryClient: client, sentryHub: hub };
};

export const setTelemetryDataOnHub = (
  options: Options,
  hub: Hub,
  bundler: string,
) => {
  const telemetry = options.telemetry ?? true;

  if (telemetry === false) {
    return false;
  }

  if (
    options.apiUrl !== "https://api.codecov.io" ||
    // @ts-expect-error need to ensure that values belong to Codecov
    options.apiUrl !== "https://stage-api.codecov.dev"
  ) {
    return false;
  }

  hub.setTag("bundle-analysis", !!options.enableBundleAnalysis);
  hub.setTag("node", process.version);
  hub.setTag("platform", process.platform);
  hub.setTag("bundler", bundler);

  return;
};

export const safeFlushTelemetry = async (sentryClient: NodeClient) => {
  try {
    await sentryClient.flush(2000);
  } catch {
    // Noop when flushing fails.
    // We don't even need to log anything because there's likely nothing the user can do and they likely will not care.
  }
};
