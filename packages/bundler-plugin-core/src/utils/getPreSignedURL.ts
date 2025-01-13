import * as Core from "@actions/core";
import {
  spanToTraceHeader,
  spanToBaggageHeader,
  startSpan,
  type Scope,
  type Span,
} from "@sentry/core";
import { z } from "zod";
import { FailedFetchError } from "../errors/FailedFetchError.ts";
import { UploadLimitReachedError } from "../errors/UploadLimitReachedError.ts";
import { type ProviderServiceParams } from "../types.ts";
import { fetchWithRetry } from "./fetchWithRetry.ts";
import { green, red } from "./logging.ts";
import { preProcessBody } from "./preProcessBody.ts";
import { findGitService } from "./findGitService.ts";
import { UndefinedGitServiceError } from "../errors/UndefinedGitServiceError.ts";
import { FailedOIDCFetchError } from "../errors/FailedOIDCFetchError.ts";
import { BadOIDCServiceError } from "../errors/BadOIDCServiceError.ts";
import { DEFAULT_API_URL } from "./normalizeOptions.ts";

interface GetPreSignedURLArgs {
  apiUrl: string;
  uploadToken?: string;
  serviceParams: Partial<ProviderServiceParams>;
  retryCount?: number;
  gitService?: string;
  oidc?: {
    useGitHubOIDC: boolean;
    gitHubOIDCTokenAudience: string;
  };
  sentryScope?: Scope;
  sentrySpan?: Span;
}

type RequestBody = Record<string, string | null | undefined>;

const PreSignedURLSchema = z.object({
  url: z.string(),
});

const API_ENDPOINT = "/upload/bundle_analysis/v1";

export const getPreSignedURL = async ({
  apiUrl,
  uploadToken,
  serviceParams,
  retryCount,
  gitService,
  oidc,
  sentryScope,
  sentrySpan,
}: GetPreSignedURLArgs) => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const requestBody: RequestBody = serviceParams;
  if (oidc?.useGitHubOIDC && Core) {
    if (serviceParams?.service !== "github-actions") {
      red("OIDC is only supported for GitHub Actions");
      throw new BadOIDCServiceError(
        "OIDC is only supported for GitHub Actions",
      );
    }

    let token = "";
    try {
      token = await Core.getIDToken(oidc.gitHubOIDCTokenAudience);
    } catch (err: unknown) {
      if (err instanceof Error) {
        red(
          `Failed to get OIDC token with url:\`${oidc.gitHubOIDCTokenAudience}\`. ${err.message}`,
        );
        throw new FailedOIDCFetchError(
          `Failed to get OIDC token with url: \`${oidc.gitHubOIDCTokenAudience}\`. ${err.message}`,
          { cause: err },
        );
      }
    }

    headers.set("Authorization", `token ${token}`);
  } else if (uploadToken) {
    headers.set("Authorization", `token ${uploadToken}`);
  } else {
    if (gitService) {
      requestBody.git_service = gitService;
    } else {
      const foundGitService = findGitService();
      if (!foundGitService || foundGitService === "") {
        red("Failed to find git service for tokenless upload");
        throw new UndefinedGitServiceError("No upload token provided");
      }

      requestBody.git_service = foundGitService;
    }
  }

  // Add Sentry headers if the API URL is the default i.e. Codecov itself
  if (sentrySpan && apiUrl === DEFAULT_API_URL) {
    // Create `sentry-trace` header
    const sentryTraceHeader = spanToTraceHeader(sentrySpan);

    // Create `baggage` header
    const sentryBaggageHeader = spanToBaggageHeader(sentrySpan);

    if (sentryTraceHeader && sentryBaggageHeader) {
      headers.set("sentry-trace", sentryTraceHeader);
      headers.set("baggage", sentryBaggageHeader);
    }
  }

  let response: Response;
  try {
    response = await startSpan(
      {
        name: "Fetching Pre-Signed URL",
        op: "http.client",
        scope: sentryScope,
        parentSpan: sentrySpan,
      },
      async (getPreSignedURLSpan) => {
        let wrappedResponse: Response;
        const HTTP_METHOD = "POST";
        const URL = `${apiUrl}${API_ENDPOINT}`;

        if (getPreSignedURLSpan) {
          getPreSignedURLSpan.setAttribute("http.request.method", HTTP_METHOD);
        }

        // we only want to set the URL attribute if the API URL is the default i.e. Codecov itself
        if (getPreSignedURLSpan && apiUrl === DEFAULT_API_URL) {
          getPreSignedURLSpan.setAttribute("http.request.url", URL);
        }

        try {
          const body = preProcessBody(requestBody);
          wrappedResponse = await fetchWithRetry({
            retryCount,
            url: URL,
            name: "`get-pre-signed-url`",
            requestData: {
              method: HTTP_METHOD,
              headers: headers,
              body: JSON.stringify(body),
            },
          });
        } catch (e) {
          red("Failed to fetch pre-signed URL");
          throw new FailedFetchError("Failed to fetch pre-signed URL", {
            cause: e,
          });
        }

        // Add attributes only if the span is present
        if (getPreSignedURLSpan) {
          // Set attributes for the response
          getPreSignedURLSpan.setAttribute(
            "http.response.status_code",
            wrappedResponse.status,
          );
          getPreSignedURLSpan.setAttribute(
            "http.response_content_length",
            Number(wrappedResponse.headers.get("content-length")),
          );
          getPreSignedURLSpan.setAttribute(
            "http.response.status_text",
            wrappedResponse.statusText,
          );
        }

        return wrappedResponse;
      },
    );
  } catch (e) {
    // re-throwing the error here
    throw e;
  }

  if (response.status === 429) {
    red("Upload limit reached");
    throw new UploadLimitReachedError("Upload limit reached");
  }

  if (!response.ok) {
    red(
      `Failed to get pre-signed URL, bad response: "${response.status} - ${response.statusText}"`,
    );
    throw new FailedFetchError("Failed to get pre-signed URL");
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    red("Failed to parse pre-signed URL body");
    throw new FailedFetchError("Failed to parse pre-signed URL body", {
      cause: e,
    });
  }

  const parsedData = PreSignedURLSchema.safeParse(data);

  if (!parsedData.success) {
    red("Failed to validate pre-signed URL");
    throw new FailedFetchError("Failed to validate pre-signed URL");
  }

  green(`Successfully pre-signed URL fetched`);
  return parsedData.data.url;
};
