import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

import { uploadStats } from "../uploadStats";
import { FailedUploadError } from "../../errors/FailedUploadError";

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

interface SetupArgs {
  sendError?: boolean;
}

describe("uploadStats", () => {
  function setup({ sendError = false }: SetupArgs) {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => null);

    server.use(
      http.put("http://localhost/upload/stats/", async ({ request }) => {
        const reader = request?.body
          ?.pipeThrough(new TextDecoderStream())
          ?.getReader();

        while (true) {
          const temp = await reader?.read();
          if (temp?.done) break;
        }

        if (!sendError) {
          return HttpResponse.json({}, { status: 200 });
        }

        return HttpResponse.error();
      }),
    );

    return {
      consoleSpy,
    };
  }

  describe("on a successful upload", () => {
    it("returns a 200", async () => {
      setup({});
      const preSignedUrl = "http://localhost/upload/stats/";
      const message = JSON.stringify({ some: "cool", stats: true });

      const response = await uploadStats({ message, preSignedUrl });

      expect(response.status).toEqual(200);
    });
  });

  describe("on a failed upload", () => {
    it("throws a FailedUploadError", async () => {
      const { consoleSpy } = setup({ sendError: true });
      const preSignedUrl = "http://localhost/upload/stats/";
      const message = JSON.stringify({ some: "cool", stats: true });

      let error;
      try {
        await uploadStats({ message, preSignedUrl });
      } catch (e) {
        error = e;
      }

      expect(consoleSpy).toHaveBeenCalled();
      expect(error).toBeInstanceOf(FailedUploadError);
    });
  });
});
