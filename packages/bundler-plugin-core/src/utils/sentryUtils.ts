import { type Options, type Output } from "src";
import { green, red } from "./logging";
export const FONT_FILE_EXTENSIONS = ["woff", "woff2", "ttf", "otf", "eot"];
export const IMAGE_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
  "apng",
  "avif",
];
export interface SentryBundleStats {
  total_size: number;
  javascript_size: number;
  css_size: number;
  fonts_size: number;
  images_size: number;
  bundle_name: string;
  environment: string;
}

export const sendSentryBundleStats = async (
  output: Output,
  userOptions: Options,
) => {
  const {
    org: sentryOrganization = process.env.SENTRY_ORG,
    project: sentryProject = process.env.SENTRY_PROJECT,
    environment: sentryEnviornment,
  } = userOptions?.sentry ?? {};
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

  if (!sentryAuthToken) {
    red("Missing Sentry Auth Token");
    return;
  }

  const { bundleName } = userOptions;
  if (
    !sentryOrganization ||
    !sentryProject ||
    !bundleName ||
    !sentryEnviornment
  ) {
    red("Missing sentry org, project or bundle name");
    return;
  }

  if (!output.assets) {
    red("We could not find any output assets from the stats file");
    return;
  }

  const bundleStats: SentryBundleStats = {
    total_size: 0,
    javascript_size: 0,
    css_size: 0,
    fonts_size: 0,
    images_size: 0,
    bundle_name: bundleName,
    environment: sentryEnviornment,
  };

  output.assets.forEach((asset) => {
    bundleStats.total_size += asset.size;
    const fileExtension = asset.name.split(".").pop();
    if (!fileExtension || fileExtension === asset.name) {
      return;
    }
    if (fileExtension === "js") {
      bundleStats.javascript_size += asset.size;
    } else if (fileExtension === "css") {
      bundleStats.css_size += asset.size;
    } else if (FONT_FILE_EXTENSIONS.includes(fileExtension)) {
      bundleStats.fonts_size += asset.size;
    } else if (IMAGE_FILE_EXTENSIONS.includes(fileExtension)) {
      bundleStats.images_size += asset.size;
    }
  });

  await sendMetrics(
    [bundleStats],
    sentryOrganization,
    sentryProject,
    sentryAuthToken,
  );
};

const sendMetrics = async (
  bundleStats: SentryBundleStats[],
  sentryOrganization: string,
  sentryProject: string,
  sentryAuthToken: string,
) => {
  const res = await fetch(
    `https://sentry.io/api/0/projects/${sentryOrganization}/${sentryProject}/bundle-stats/`,
    {
      method: "POST",
      body: JSON.stringify({ stats: bundleStats }),
      headers: {
        Authorization: `Bearer ${sentryAuthToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (res.status === 200) {
    green("Sentry Metrics added!");
    const bundleStatsString: string = bundleStats
      .map(
        (bundle) => `
    ${bundle.bundle_name}
    total bundle size: ${bundle.total_size}
    javascript size: ${bundle.javascript_size}
    css size: ${bundle.css_size}
    fonts size: ${bundle.fonts_size}
    images size: ${bundle.images_size}
    `,
      )
      .join("\n");

    green(`The following stats were sent: \n${bundleStatsString}`);
  } else {
    const body = await res.json();
    red(`Failed to send metrics to do the error: \n ${body}`);
  }
};
