import { z } from "zod";

interface GetPreSignedURLArgs {
  apiURL: string;
  globalUploadToken?: string;
  repoToken?: string;
}

const PreSignedURLSchema = z.object({
  url: z.string(),
});

export const getPreSignedURL =
  ({ apiURL, globalUploadToken, repoToken }: GetPreSignedURLArgs) =>
  async () => {
    const token = globalUploadToken ?? repoToken;
    const commitSha = "";
    const url = `http://${apiURL}/upload/service/commits/${commitSha}/bundle_analysis`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${token}`,
        },
      });

      const data = await response.json();
      const parsedData = PreSignedURLSchema.parse(data);

      return parsedData.url;
    } catch (e) {
      console.error(e);
    }

    return;
  };
