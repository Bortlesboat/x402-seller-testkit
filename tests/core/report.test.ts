import { describe, expect, it } from "vitest";

import { summarizeRun } from "../../src/core/report";

describe("summarizeRun", () => {
  it("counts pass, fail, and skip results", () => {
    const result = summarizeRun({
      target: "http://localhost:4123/protected",
      profile: "local-mock",
      results: [
        { id: "challenge-shape", status: "pass", summary: "402 returned" },
        {
          id: "success-path",
          status: "fail",
          summary: "Expected 200 after payment",
          fix: "Check facilitator URL"
        },
        {
          id: "retry-idempotency",
          status: "skip",
          summary: "Payment env missing"
        }
      ]
    });

    expect(result.counts).toEqual({ pass: 1, fail: 1, skip: 1 });
  });

  it('prefers failing fixes in the "fix this next" summary', () => {
    const result = summarizeRun({
      target: "http://localhost:4123/protected",
      profile: "local-mock",
      results: [
        {
          id: "malformed-payment-rejected",
          status: "skip",
          summary: "Skipped for now",
          fix: "Wire up malformed header fixtures"
        },
        {
          id: "success-path",
          status: "fail",
          summary: "Expected 200 after payment",
          fix: "Check facilitator URL"
        }
      ]
    });

    expect(result.nextFix).toContain("Check facilitator URL");
    expect(result.nextFix).not.toContain("Wire up malformed header fixtures");
  });
});
