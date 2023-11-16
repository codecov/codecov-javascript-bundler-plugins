import { ReadableStream, TextEncoderStream } from "node:stream/web";
import https from "https";

function supportsRequestStreams() {
  let duplexAccessed = false;

  // early return if Request is not available
  if (typeof Request === "undefined") {
    return false;
  }

  const hasContentType = new Request("http://127.0.0.1", {
    // @ts-expect-error checking to see if the ReadableStream is sent
    // to a toString value which indicates that streams are not
    // supported in the running version of node
    body: new ReadableStream(),
    method: "PUT",
    get duplex() {
      duplexAccessed = true;
      return "half";
    },
  }).headers.has("Content-type");

  return duplexAccessed && !hasContentType;
}

interface HandlePreFetchUploadArgs {
  message: string;
  preSignedUrl: string;
}

function handlePreFetchUpload({
  message,
  preSignedUrl,
}: HandlePreFetchUploadArgs) {
  const url = new URL(preSignedUrl);

  try {
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
      },
      (res) => {
        res.on("data", () => null);
        res.on("end", () => {
          console.debug("\nStatus code:", res.statusCode);
        });
      },
    );

    req.write(message);
    req.end();
  } catch (e) {
    console.debug("\n", e);
  }
}

interface HandleFetchUploadArgs {
  message: string;
  preSignedUrl: string;
}

async function handleFetchUpload({
  message,
  preSignedUrl,
}: HandleFetchUploadArgs) {
  const iterator = message[Symbol.iterator]();
  const stream = new ReadableStream({
    pull(controller) {
      const iteration = iterator.next();

      if (iteration.done) {
        controller.close();
      } else {
        controller.enqueue(iteration.value);
      }
    },
  }).pipeThrough(new TextEncoderStream());

  try {
    const response = await fetch(preSignedUrl, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      duplex: "half",
      // @ts-expect-error TypeScript doesn't know that fetch can accept a
      // ReadableStream as the body
      body: stream,
    });

    console.debug("\n response: ", response.ok);
  } catch (e) {
    console.error(e);
  }
}

interface HandleUploadArgs {
  message: string;
  preSignedUrl: string;
}

export async function handleUpload({
  message,
  preSignedUrl,
}: HandleUploadArgs) {
  if (supportsRequestStreams()) {
    await handleFetchUpload({ message, preSignedUrl });
  } else {
    handlePreFetchUpload({ message, preSignedUrl });
  }
}
