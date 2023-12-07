import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

app.all(
  "/:status{[0-9]{3}}/upload/bundle_analysis/v1/:badPUT{true|false}",
  (c) => {
    const status = parseInt(c.req.param("status"));
    const badPUT = c.req.param("badPUT") === "true";

    if (status >= 400 && !badPUT) {
      return c.text(`Error code: ${status}`, { status });
    }

    const url = new URL(c.req.url);
    let putURL = `${url.protocol}//${url.host}/file-upload`;

    if (badPUT) {
      putURL = `${putURL}/${status}`;
    }

    return c.json(
      {
        url: putURL,
      },
      { status: 200 },
    );
  },
);

app.all("/file-upload/:status{[0-9]{3}}", async (c) => {
  const status = parseInt(c.req.param("status"));

  if (status >= 400) {
    return c.text(`Error code: ${status}`, { status });
  }

  await c.req.json();

  return c.text("File uploaded successfully", { status: 200 });
});

serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    console.info(`🚀 Server listening on ${info.address}:${info.port}`);
  },
);
