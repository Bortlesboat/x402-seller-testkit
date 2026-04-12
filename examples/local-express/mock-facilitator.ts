import { createServer } from "node:http";

import express from "express";

import { parsePaymentPayload, parsePaymentRequired } from "@x402/core/schemas";

import {
  buildLocalMockSettleResponse,
  matchesLocalMockPayload
} from "../../src/fixtures/local-mock.js";

type FacilitatorRequestBody = {
  paymentPayload?: unknown;
  paymentRequired?: unknown;
};

type StartedServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

async function listen(app: ReturnType<typeof express>) {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve mock facilitator address");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  } satisfies StartedServer;
}

function parseBody(body: FacilitatorRequestBody) {
  const paymentPayload = parsePaymentPayload(body.paymentPayload);
  const paymentRequired = parsePaymentRequired(body.paymentRequired);

  if (!paymentPayload.success || !paymentRequired.success) {
    return null;
  }

  if (paymentPayload.data.x402Version !== 2 || paymentRequired.data.x402Version !== 2) {
    return null;
  }

  return {
    paymentPayload: paymentPayload.data,
    paymentRequired: paymentRequired.data
  };
}

export async function startMockFacilitator(): Promise<StartedServer> {
  const app = express();
  app.use(express.json());

  app.post("/verify", (req, res) => {
    const parsed = parseBody(req.body as FacilitatorRequestBody);
    if (!parsed || !matchesLocalMockPayload(parsed.paymentPayload)) {
      res.status(400).json({
        isValid: false,
        invalidReason: "invalid_mock_payment",
        invalidMessage: "Mock payment payload failed validation."
      });
      return;
    }

    res.json({
      isValid: true,
      payer: "mock-payer"
    });
  });

  app.post("/settle", (req, res) => {
    const parsed = parseBody(req.body as FacilitatorRequestBody);
    if (!parsed || !matchesLocalMockPayload(parsed.paymentPayload)) {
      res.status(400).json({
        success: false,
        errorReason: "invalid_mock_payment",
        errorMessage: "Mock payment payload failed validation.",
        transaction: "0xrejected",
        network: "mock:local"
      });
      return;
    }

    res.json(buildLocalMockSettleResponse());
  });

  return listen(app);
}
