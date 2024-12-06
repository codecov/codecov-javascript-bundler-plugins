import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createSentryInstance,
  setTelemetryDataOnScope,
  safeFlushTelemetry,
  telemetryPlugin,
} from "../telemetry";
import { type Client, type Scope } from "@sentry/core";
import { type NormalizedOptions } from "../../utils/normalizeOptions";

const mocks = vi.hoisted(() => ({
  cyan: vi.fn(),
}));

vi.mock("../../utils/logging", () => ({
  cyan: mocks.cyan,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("telemetry", () => {
  describe("createSentryInstance", () => {
    it("creates instance with telemetry enabled", () => {
      const options = {
        telemetry: true,
        dryRun: false,
      } as NormalizedOptions;
      const pluginInfo = {
        name: "test-plugin",
        version: "1.0.0",
      };

      const { sentryClient, sentryScope } = createSentryInstance(
        true,
        false,
        pluginInfo,
        options,
      );

      expect(sentryClient).toBeDefined();
      expect(sentryScope).toBeDefined();
    });

    it("creates instance with telemetry disabled", () => {
      const options = {
        telemetry: false,
        dryRun: false,
      } as NormalizedOptions;
      const pluginInfo = {
        name: "test-plugin",
        version: "1.0.0",
      };

      const { sentryClient, sentryScope } = createSentryInstance(
        false,
        false,
        pluginInfo,
        options,
      );

      expect(sentryClient).toBeDefined();
      expect(sentryScope).toBeDefined();
    });
  });

  describe("setTelemetryDataOnScope", () => {
    it("sets correct tags for token auth", () => {
      const scope = {
        setTag: vi.fn(),
      } as unknown as Scope;

      const options = {
        dryRun: false,
        uploadToken: "some-token",
        gitService: "github",
      } as NormalizedOptions;

      const pluginInfo = {
        name: "test-plugin",
        version: "1.0.0",
      };

      setTelemetryDataOnScope(options, pluginInfo, scope);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(scope.setTag).toHaveBeenCalledWith("auth_mode", "token");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(scope.setTag).toHaveBeenCalledWith("git_service", "github");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(scope.setTag).toHaveBeenCalledWith("plugin.name", "test-plugin");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(scope.setTag).toHaveBeenCalledWith("plugin.version", "1.0.0");
    });

    it("sets correct tags for github OIDC auth", () => {
      const scope = {
        setTag: vi.fn(),
      } as unknown as Scope;

      const options = {
        dryRun: false,
        oidc: { useGitHubOIDC: true },
      } as NormalizedOptions;

      const pluginInfo = {
        name: "test-plugin",
        version: "1.0.0",
      };

      setTelemetryDataOnScope(options, pluginInfo, scope);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(scope.setTag).toHaveBeenCalledWith("auth_mode", "github-oidc");
    });
  });

  describe("safeFlushTelemetry", () => {
    it("handles successful flush", async () => {
      const client = {
        flush: vi.fn().mockResolvedValue(undefined),
      } as unknown as Client;

      await safeFlushTelemetry(client);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.flush).toHaveBeenCalledWith(2000);
    });

    it("handles failed flush without throwing", async () => {
      const client = {
        flush: vi.fn().mockRejectedValue(new Error("Flush failed")),
      } as unknown as Client;

      await expect(safeFlushTelemetry(client)).resolves.not.toThrow();
    });
  });

  describe("telemetryPlugin", () => {
    it("logs message and starts span when telemetry enabled", async () => {
      const client = {
        flush: vi.fn().mockResolvedValue(undefined),
        getOptions: vi.fn().mockReturnValue(undefined),
      } as unknown as Client;

      const scope = {
        getClient: vi.fn(() => client),
      } as unknown as Scope;

      const plugin = telemetryPlugin({
        sentryClient: client,
        sentryScope: scope,
        shouldSendTelemetry: true,
      });

      // @ts-expect-error: buildStart is not defined in the type
      await plugin.buildStart?.();

      expect(mocks.cyan).toHaveBeenCalledWith(
        "Sending telemetry data on issues and performance to Codecov. To disable telemetry, set `options.telemetry` to `false`.",
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.flush).toHaveBeenCalled();
    });

    it("does not log message or start span when telemetry disabled", async () => {
      const client = {
        flush: vi.fn().mockResolvedValue(undefined),
      } as unknown as Client;

      const scope = {} as Scope;

      const plugin = telemetryPlugin({
        sentryClient: client,
        sentryScope: scope,
        shouldSendTelemetry: false,
      });

      // @ts-expect-error: buildStart is not defined in the type
      await plugin.buildStart?.();

      expect(mocks.cyan).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.flush).not.toHaveBeenCalled();
    });
  });
});
