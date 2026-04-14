import { describe, expect, it, vi } from "vitest";
import { encodePaymentRequiredHeader } from "@x402/core/http";
import type { PaymentRequired } from "@x402/core/types";

import { runChallengeShapeCheck } from "../../src/checks/challenge-shape.js";

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
      network: "eip155:84532",
      amount: "10000",
      asset: "0x0000000000000000000000000000000000000001",
      payTo: "0x0000000000000000000000000000000000000002",
      maxTimeoutSeconds: 60,
      extra: {
        facilitatorUrl: "https://facilitator.example.com",
      },
    },
  ],
};

describe("runChallengeShapeCheck", () => {
  it("passes when the unpaid probe returns 402 with a valid PAYMENT-REQUIRED header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 402,
        headers: {
          "PAYMENT-REQUIRED": encodePaymentRequiredHeader(validPaymentRequired),
        },
      }),
    );

    const result = await runChallengeShapeCheck({
      target: "http://localhost:4123/protected",
      fetchImpl,
    });

    expect(result.status).toBe("pass");
    expect(result.summary).toContain("PAYMENT-REQUIRED");
  });

  it("fails when 402 is returned without the PAYMENT-REQUIRED header", async () => {
    const result = await runChallengeShapeCheck({
      target: "http://localhost:4123/protected",
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 402 })),
    });

    expect(result.status).toBe("fail");
    expect(result.fix).toContain("PAYMENT-REQUIRED");
  });

  it("fails when an unpaid probe incorrectly returns 200", async () => {
    const result = await runChallengeShapeCheck({
      target: "http://localhost:4123/protected",
      fetchImpl: vi.fn().mockResolvedValue(new Response("ok", { status: 200 })),
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("Expected 402");
  });

  it("fails when the PAYMENT-REQUIRED header is not valid base64", async () => {
    const result = await runChallengeShapeCheck({
      target: "http://localhost:4123/protected",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(null, {
          status: 402,
          headers: {
            "PAYMENT-REQUIRED": "not-base64",
          },
        }),
      ),
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("Invalid");
  });

  it("fails when the PAYMENT-REQUIRED header decodes to an invalid schema", async () => {
    const invalidHeader = Buffer.from(
      JSON.stringify({
        x402Version: 2,
        accepts: [],
      }),
      "utf8",
    ).toString("base64");

    const result = await runChallengeShapeCheck({
      target: "http://localhost:4123/protected",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(null, {
          status: 402,
          headers: {
            "PAYMENT-REQUIRED": invalidHeader,
          },
        }),
      ),
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("schema");
  });
});
