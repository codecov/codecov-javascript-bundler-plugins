import { type Client, type Scope } from "@sentry/core";
import {
  type Asset,
  type BundleAnalysisUploadPlugin,
  type BundleAnalysisUploadPluginArgs,
  type BundleAnalysisUploadPluginReturn,
  type ExtendedBAUploadArgs,
  type ExtendedBAUploadPlugin,
  type Chunk,
  type Module,
  type Options,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "./types.ts";
import {
  checkNodeVersion,
  createRollupAsset,
  getCompressedSize,
  handleErrors,
  type NormalizedOptions,
  normalizeOptions,
  normalizePath,
  Output,
  red,
} from "./utils";
import {
  createSentryInstance,
  telemetryPlugin,
  safeFlushTelemetry,
  setTelemetryDataOnScope,
} from "./sentry/telemetry.ts";

export type {
  Asset,
  BundleAnalysisUploadPlugin,
  BundleAnalysisUploadPluginArgs,
  BundleAnalysisUploadPluginReturn,
  ExtendedBAUploadArgs,
  ExtendedBAUploadPlugin,
  Chunk,
  Module,
  Options,
  NormalizedOptions,
  ProviderUtilInputs,
  UploadOverrides,
  Client as SentryClient,
  Scope as SentryScope,
};

export {
  checkNodeVersion,
  createRollupAsset,
  handleErrors,
  getCompressedSize,
  normalizeOptions,
  normalizePath,
  Output,
  red,
  createSentryInstance,
  telemetryPlugin,
  safeFlushTelemetry,
  setTelemetryDataOnScope,
};
