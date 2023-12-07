import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    console.info(`🚀 Server listening on ${info.address}:${info.port}`);
  },
);
