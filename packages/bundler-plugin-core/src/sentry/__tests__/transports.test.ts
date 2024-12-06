/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";

import {
  createRequestExecutor,
  makeNodeTransport,
  makeOptionallyEnabledNodeTransport,
  streamFromBody,
} from "../transports.ts";
import { type Envelope } from "@sentry/core";

const mocks = vi.hoisted(() => ({
  statusCode: 200,
  requestCalled: vi.fn(),
}));

// Mock the node:https module
vi.mock("node:https", () => {
  return {
    request: vi.fn((options: any, callback: (arg?: any) => void) => {
      const response = {
        statusCode: mocks.statusCode,
        setEncoding: vi.fn(),
        headers: {},
        on: vi.fn((event: any, handler: (arg?: any) => void) => {
          if (event === "data") {
            handler("mocked data");
          }
          if (event === "end") {
            handler();
          }
        }),
      };
      callback(response);
      mocks.requestCalled(options);
      return {
        end: vi.fn(),
        write: vi.fn(),
      };
    }),
  };
});

describe("transports", () => {
  describe("streamFromBody", () => {
    it("should return a readable stream from a Uint8Array", () => {
      const body = new Uint8Array([1, 2, 3]);
      const stream = streamFromBody(body);

      expect(stream.read()).toEqual(Buffer.from(body));
    });
  });

  describe("createRequestExecutor", () => {
    it("should create a request executor", () => {
      const executor = createRequestExecutor({
        url: "https://localhost/upload",
        recordDroppedEvent: () => {
          /* */
        },
      });

      expect(executor).toBeDefined();
      expect(typeof executor).toBe("function");
    });

    describe("when the request is successful", () => {
      it("should return a response", async () => {
        const makeRequest = createRequestExecutor({
          url: "https://localhost/upload",
          recordDroppedEvent: () => {
            /* */
          },
        });

        const response = await makeRequest({
          body: new Uint8Array([1, 2, 3]),
        });

        await vi.waitFor(() => expect(response.statusCode).toBe(200));
      });
    });

    describe("when the request fails", () => {
      it("should return a response", async () => {
        mocks.statusCode = 500;

        const makeRequest = createRequestExecutor({
          url: "https://localhost/upload",
          recordDroppedEvent: () => {
            /* */
          },
        });

        const response = await makeRequest({
          body: new Uint8Array([1, 2, 3]),
        });

        await vi.waitFor(() => expect(response.statusCode).toBe(500));
      });
    });
  });

  describe("makeNodeTransport", () => {
    it("should create a node transport object", () => {
      const transport = makeNodeTransport({
        url: "https://localhost/upload",
        recordDroppedEvent: () => {
          /* */
        },
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("object");
    });
  });

  describe("makeOptionallyEnabledNodeTransport", () => {
    it("should create an optionally enabled node transport", () => {
      const transport = makeOptionallyEnabledNodeTransport(true);

      expect(transport).toBeDefined();
      expect(typeof transport).toBe("function");
    });

    describe("when the transport is enabled", () => {
      it("should send requests", async () => {
        const transport = makeOptionallyEnabledNodeTransport(true);

        const transportObject = transport({
          url: "https://localhost/upload",
          recordDroppedEvent: () => {
            /* */
          },
        });

        const mockEnvelope: Envelope = [
          { event_id: "test-event-id", sent_at: new Date().toISOString() },
          [],
        ];

        await transportObject.send(mockEnvelope);

        expect(mocks.requestCalled).toHaveBeenCalled();
        expect(mocks.requestCalled).toHaveBeenCalledWith({
          headers: {},
          hostname: "localhost",
          method: "POST",
          path: "/upload",
          port: "",
          protocol: "https:",
        });
      });
    });

    describe("when the transport is disabled", () => {
      it("should not send requests", async () => {
        const transport = makeOptionallyEnabledNodeTransport(false);

        const transportObject = transport({
          url: "https://localhost/upload",
          recordDroppedEvent: () => {
            /* */
          },
        });

        const mockEnvelope: Envelope = [
          { event_id: "test-event-id", sent_at: new Date().toISOString() },
          [],
        ];
        const response = await transportObject.send(mockEnvelope);

        await vi.waitFor(() => expect(response.statusCode).toBe(200));
      });
    });
  });
});
