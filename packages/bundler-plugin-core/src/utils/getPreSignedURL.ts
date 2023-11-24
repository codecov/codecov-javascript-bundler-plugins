import { z } from "zod";
import { red } from "./logging.ts";
import { type ProviderServiceParams } from "@/types.ts";
import { NoUploadTokenError } from "@/errors/NoUploadTokenError.ts";
import { FailedFetchError } from "@/errors/FailedFetchError.ts";

interface GetPreSignedURLArgs {
  apiURL: string;
  globalUploadToken?: string;
  repoToken?: string;
  serviceParams: Partial<ProviderServiceParams>;
}

interface SentServiceParams extends ProviderServiceParams {
  token: string;
}

const PreSignedURLSchema = z.object({
  url: z.string(),
});

export const getPreSignedURL = async ({
  apiURL,
  globalUploadToken,
  repoToken,
  serviceParams,
}: GetPreSignedURLArgs) => {
  let token = "";
  const commitSha = serviceParams?.commit ?? "";
  const url = `${apiURL}/upload/service/commits/${commitSha}/bundle_analysis`;

  if (globalUploadToken && !repoToken) {
    token = globalUploadToken;
  } else if (repoToken && !globalUploadToken) {
    token = repoToken;
  } else if (!globalUploadToken && !repoToken) {
    red(`No upload token found`);
    throw new NoUploadTokenError("No upload token found");
  }

  const sentServiceParams: SentServiceParams = {
    branch: serviceParams?.branch ?? "",
    build: serviceParams?.build ?? "",
    buildURL: serviceParams?.buildURL ?? "",
    commit: commitSha,
    job: serviceParams?.job ?? "",
    name: serviceParams?.name ?? "",
    parent: serviceParams?.parent ?? "",
    project: serviceParams?.project ?? "",
    pr: serviceParams?.pr ?? "",
    slug: serviceParams?.slug ?? "",
    server_uri: serviceParams?.server_uri ?? "",
    service: serviceParams?.service ?? "",
    tag: serviceParams?.tag ?? "",
    token,
  };

  try {
    const response = await fetchRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
        body: JSON.stringify(sentServiceParams),
      },
      3,
    );

    const data = await response.json();
    const parsedData = PreSignedURLSchema.safeParse(data);

    if (parsedData.success) {
      return parsedData.data.url;
    }

    console.info("ahh");

    red(`Failed to get pre-signed URL`);
    throw new FailedFetchError("Failed to get pre-signed URL");
  } catch (e) {
    red(`Failed to get pre-signed URL: ${e}`);
    throw new FailedFetchError("Failed to get pre-signed URL");
  }
};

const fetchRetry = async (url: string, options: RequestInit, n: number) => {
  let response = new Response();
  for (let i = 0; i < n; i++) {
    try {
      response = await fetch(url, options);
      break;
    } catch (err) {
      const isLastAttempt = i + 1 === n;
      if (isLastAttempt) {
        throw err;
      }
    }
  }
  return response;
};
