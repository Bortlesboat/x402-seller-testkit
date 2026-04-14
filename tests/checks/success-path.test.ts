import { afterEach, describe, expect, it } from "vitest";
import { encodePaymentResponseHeader } from "@x402/core/http";
import type { PaymentRequired, SettleResponse } from "@x402/core/types";

import { runSuccessPathCheck } from "../../src/checks/success-path.js";
import { startLocalExpressServer } from "../../examples/local-express/server.js";
import { startMockFacilitator } from "../../examples/local-express/mock-facilitator.js";

const validPaymentRequired: PaymentRequired = {
  x402Version: 2,
  resource: {
    url: "http://localhost:4123/protected",
    description: "Protected test resource",
    mimeType: "application/json",
  },
  accepts: [
    {
      scheme: "exact",
      network: "mock:local",
      amount: "10000",
      asset: "mock:usdc",
      payTo: "seller:local",
      maxTimeoutSeconds: 60,
      extra: {
        facilitatorUrl: "http://localhost:4000",
      },
    },
  ],
};

describe("runSuccessPathCheck", () => {
  let closeSeller: (() => Promise<void>) | undefined;
  let closeFacilitator: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeSeller) {
      await closeSeller();
      closeSeller = undefined;
    }

    if (closeFacilitator) {
      await closeFacilitator();
      closeFacilitator = undefined;
    }
  });

  it("passes against the local mock seller and facilitator", async () => {
    const facilitator = await startMockFacilitator();
    closeFacilitator = facilitator.close;

    const seller = await startLocalExpressServer({
      facilitatorUrl: facilitator.baseUrl,
    });
    closeSeller = seller.close;

    const result = await runSuccessPathCheck({
      target: `${seller.baseUrl}/protected`,
      payment: {
        mode: "mock",
        ready: true,
        missing: [],
      },
    });

    expect(result.status).toBe("pass");
    expect(result.summary).toContain("PAYMENT-RESPONSE");
  });

  it("fails when the settlement response does not match the challenged amount", async () => {
    const mismatchedSettlement: SettleResponse = {
      success: true,
      payer: "mock-payer",
      transaction: "0xmocksettlement",
      network: "mock:local",
      amount: "9999",
    };

    const fetchImpl = async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "PAYMENT-RESPONSE": encodePaymentResponseHeader(mismatchedSettlement),
        },
      });

    const result = await runSuccessPathCheck({
      target: "http://localhost:4123/protected",
      payment: {
        mode: "mock",
        ready: true,
        missing: [],
      },
      paymentRequired: validPaymentRequired,
      fetchImpl,
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("amount");
  });
});
