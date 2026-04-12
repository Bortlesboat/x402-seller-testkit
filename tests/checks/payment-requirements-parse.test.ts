import { describe, expect, it } from "vitest";

import { runPaymentRequirementsParseCheck } from "../../src/checks/payment-requirements-parse.js";

const validPaymentRequired = {
  x402Version: 2,
  resource: {
    url: "http://localhost:4123/protected",
    description: "Protected test resource",
    mimeType: "application/json"
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
        facilitatorUrl: "https://facilitator.example.com"
      }
    }
  ]
} as const;

describe("runPaymentRequirementsParseCheck", () => {
  it("passes for a valid accepted payment requirement", () => {
    const result = runPaymentRequirementsParseCheck({
      paymentRequired: validPaymentRequired
    });

    expect(result.status).toBe("pass");
    expect(result.summary).toContain("accepts");
  });

  it("fails when the accepted requirement is missing a network", () => {
    const result = runPaymentRequirementsParseCheck({
      paymentRequired: {
        ...validPaymentRequired,
        accepts: [
          {
            ...validPaymentRequired.accepts[0],
            network: ""
          }
        ]
      }
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("network");
  });

  it("fails when the accepted requirement is missing a scheme", () => {
    const result = runPaymentRequirementsParseCheck({
      paymentRequired: {
        ...validPaymentRequired,
        accepts: [
          {
            ...validPaymentRequired.accepts[0],
            scheme: ""
          }
        ]
      }
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("scheme");
  });

  it("fails when the facilitator URL is present but invalid", () => {
    const result = runPaymentRequirementsParseCheck({
      paymentRequired: {
        ...validPaymentRequired,
        accepts: [
          {
            ...validPaymentRequired.accepts[0],
            extra: {
              facilitatorUrl: "not-a-url"
            }
          }
        ]
      }
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("facilitator");
  });

  it("fails when accepts is not a non-empty array", () => {
    const result = runPaymentRequirementsParseCheck({
      paymentRequired: {
        ...validPaymentRequired,
        accepts: []
      }
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("accepts");
  });
});
