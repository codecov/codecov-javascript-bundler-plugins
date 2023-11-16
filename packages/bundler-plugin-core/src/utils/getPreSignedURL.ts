import https from "https";
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
    const url = `http://${apiURL}/upload/service/commits/sha/bundle_analysis`;

    if (typeof fetch !== "undefined") {
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
    } else {
      let presignedURL = "";
      const urlObj = new URL(url);

      try {
        const req = https.request(
          {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `token ${token}`,
            },
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              presignedURL = data;
            });
          },
        );
        req.end();

        return presignedURL;
      } catch (e) {
        console.error(e);
      }
    }

    return;
  };
