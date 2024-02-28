import { type Options, type Output } from "../../../src";
import { type SentryBundleStats, sendSentryBundleStats } from "../sentryUtils";

const fetchSpy: jest.SpyInstance = jest
  .spyOn(global, "fetch")
  .mockResolvedValue(new Response(undefined, { status: 200 }));

const mockOutput: Output = {
  bundleName: "my_bundle",
  assets: [
    { name: "bundle.js", normalized: "bundle.js", size: 100 },
    { name: "bundle_2.js", normalized: "bundle_2.js", size: 120 },
    { name: "styles.css", normalized: "styles.css", size: 150 },
  ],
};

const mockOptions: Options = {
  bundleName: "my_bundle",
  enableBundleAnalysis: true,
  sentry: {
    sentryOnly: true,
    enviornment: "test",
    org: "test-org",
    project: "test-project",
  },
};

describe("SentryUtils", () => {
  beforeEach(() => {
    setSentryEnvVariables("test-token");
    jest.clearAllMocks();
  });

  afterAll(() => {
    setSentryEnvVariables();
  });

  it("should call sentry api with correct body if all options are provided", async () => {
    await sendSentryBundleStats(mockOutput, mockOptions);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://sentry.io/api/0/projects/test-org/test-project/bundle-stats/",
      {
        body: JSON.stringify({
          stats: [
            {
              total_size: 370,
              javascript_size: 220,
              css_size: 150,
              fonts_size: 0,
              images_size: 0,
              bundle_name: "my_bundle",
              environment: "test",
            } satisfies SentryBundleStats,
          ],
        }),
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("should not call api if missing token", async () => {
    setSentryEnvVariables();
    await sendSentryBundleStats(mockOutput, mockOptions);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

const setSentryEnvVariables = (authToken?: string) => {
  if (authToken) {
    process.env.SENTRY_AUTH_TOKEN = authToken;
  } else {
    process.env.SENTRY_AUTH_TOKEN = undefined;
    delete process.env.SENTRY_AUTH_TOKEN;
  }
};
