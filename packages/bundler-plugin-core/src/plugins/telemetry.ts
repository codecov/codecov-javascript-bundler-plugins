import { type Hub, type NodeClient } from "@sentry/node";
import { type UnpluginOptions } from "unplugin";
import { dim } from "../utils/logging";
import { safeFlushTelemetry } from "../sentry";

interface TelemetryPluginOptions {
  sentryHub?: Hub;
  sentryClient?: NodeClient;
  shouldSendTelemetry: boolean;
}

export function telemetryPlugin({
  sentryHub,
  sentryClient,
  shouldSendTelemetry,
}: TelemetryPluginOptions): UnpluginOptions {
  return {
    name: "codecov-telemetry-plugin",
    async buildStart() {
      if (shouldSendTelemetry && sentryHub && sentryClient) {
        dim(
          "Sending error and performance telemetry data to Sentry. To disable telemetry, set `options.telemetry` to `false`.",
        );
        sentryHub
          .startTransaction({ name: "Codecov Bundler Plugin execution" })
          .finish();
        await safeFlushTelemetry(sentryClient);
      }
    },
  };
}
