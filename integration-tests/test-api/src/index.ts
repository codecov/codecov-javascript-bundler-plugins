import { Hono } from "hono";
import { Database } from "bun:sqlite";

console.log("connecting to sqlite");
const sqlite = new Database(":memory:", { readwrite: true });
console.log("connected to sqlite");

console.log('creating "stats" table');
const query = sqlite.query(
  "CREATE TABLE `stats` (`id` text, `bundle_name` text UNIQUE, `json_stats` text);",
);
query.run();
console.log('created "stats" table');

console.log("starting api");
const app = new Hono();

app.all("/ping", (c) => {
  return c.text("pong", 200);
});

app.all(
  "/test-url/:id/:status/:badPUT{true|false}/upload/bundle_analysis/v1",
  (c) => {
    const id = c.req.param("id");
    const status = parseInt(c.req.param("status"));
    const badPUT = c.req.param("badPUT") === "true";
    const url = new URL(c.req.url);
    const putURL = `${url.protocol}//${url.host}/file-upload/${id}/${status}`;

    if (status >= 400 && !badPUT) {
      return c.text(`Error code: ${status}`, { status });
    }

    console.log("PUT URL", putURL);

    return c.json(
      {
        url: putURL,
      },
      { status: 200 },
    );
  },
);

app.all("/file-upload/:id/:status{[0-9]{3}}", async (c) => {
  const id = c.req.param("id");
  const status = parseInt(c.req.param("status"));

  if (status >= 400) {
    return c.text(`Error code: ${status}`, { status });
  }

  console.log("uploading file");
  const data: { bundleName: string } = await c.req.json();
  console.log("finished upload");

  console.log("inserting stats");
  const bundleName = data!.bundleName;
  const insertStats = JSON.stringify(data);
  const query = sqlite.query(
    `INSERT INTO stats (id, bundle_name, json_stats) VALUES ('${id}', '${bundleName}', '${insertStats}')`,
  );
  query.run();
  query.finalize();
  console.log("inserted stats");

  return c.text("File uploaded successfully", { status: 200 });
});

app.all("/get-stats/:id", (c) => {
  const id = c.req.param("id");
  console.log("getting stats", id);

  const query = sqlite.query("SELECT * FROM stats WHERE id = $id");
  const result = query.get({ $id: id }) as { id: string; json_stats: string };
  query.finalize();

  if (result) {
    console.log("stats found", id);
    const query = sqlite.query(`DELETE FROM stats WHERE id = "${id}"`);
    query.run();
    query.finalize();
    return c.json({ stats: result.json_stats }, { status: 200 });
  }

  console.log("stats not found", id);
  return c.text("Not found", { status: 404 });
});

app.all("/get-stats-by-bundle-name/:bundleName", (c) => {
  const bundleName = c.req.param("bundleName");
  console.log("getting stats", bundleName);

  const query = sqlite.query(
    "SELECT * FROM stats WHERE bundle_name = $bundleName",
  );
  const result = query.get({ $bundleName: bundleName }) as {
    id: string;
    json_stats: string;
  };
  query.finalize();

  if (result) {
    console.log("stats found", bundleName);
    const query = sqlite.query(
      `DELETE FROM stats WHERE bundle_name = '${bundleName}'`,
    );
    query.run();
    query.finalize();
    return c.json({ stats: result.json_stats }, { status: 200 });
  }

  console.log("stats not found", bundleName);
  return c.text("Not found", { status: 404 });
});

export default app;
