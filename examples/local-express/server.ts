import { createServer } from "node:http";

import express from "express";

import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader
} from "@x402/core/http";
import { parsePaymentPayload } from "@x402/core/schemas";

import {
  buildLocalMockPaymentRequired,
  matchesLocalMockPayload
} from "../../src/fixtures/local-mock.js";

type StartedServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

type StartLocalExpressServerInput = {
  facilitatorUrl: string;
};

async function listen(app: ReturnType<typeof express>) {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve local seller address");
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

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json();
  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

export async function startLocalExpressServer(
  input: StartLocalExpressServerInput,
): Promise<StartedServer> {
  const app = express();

  app.get("/protected", async (req, res) => {
    const resourceUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const paymentRequired = buildLocalMockPaymentRequired(resourceUrl, input.facilitatorUrl);
    const paymentSignatureHeader = req.get("PAYMENT-SIGNATURE");

    if (!paymentSignatureHeader) {
      res.status(402).set("PAYMENT-REQUIRED", encodePaymentRequiredHeader(paymentRequired)).json({
        error: "payment required"
      });
      return;
    }

    let paymentPayload;
    try {
      paymentPayload = decodePaymentSignatureHeader(paymentSignatureHeader);
    } catch {
      res.status(400).json({ error: "invalid PAYMENT-SIGNATURE header" });
      return;
    }

    const parsed = parsePaymentPayload(paymentPayload);
    if (!parsed.success || parsed.data.x402Version !== 2 || !matchesLocalMockPayload(parsed.data)) {
      res.status(400).json({ error: "mock payment payload failed validation" });
      return;
    }

    const verify = await postJson(`${input.facilitatorUrl}/verify`, {
      paymentPayload: parsed.data,
      paymentRequired
    });

    if (!verify.ok || !verify.payload.isValid) {
      res.status(400).json({ error: "payment rejected by facilitator" });
      return;
    }

    const settle = await postJson(`${input.facilitatorUrl}/settle`, {
      paymentPayload: parsed.data,
      paymentRequired
    });

    if (!settle.ok || !settle.payload.success) {
      res.status(502).json({ error: "payment settlement failed" });
      return;
    }

    res
      .status(200)
      .set("PAYMENT-RESPONSE", encodePaymentResponseHeader(settle.payload))
      .json({
        ok: true,
        invoiceId: parsed.data.payload.invoiceId
      });
  });

  return listen(app);
}
