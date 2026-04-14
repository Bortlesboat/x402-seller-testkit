import { describe, expect, it, vi } from "vitest";

import { malformedPaymentHeaders } from "../../src/fixtures/malformed-payment.js";
import { runMalformedPaymentRejectedCheck } from "../../src/checks/malformed-payment-rejected.js";

describe("runMalformedPaymentRejectedCheck", () => {
  it("passes when all malformed payment attempts return client errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 402 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }))
      .mockResolvedValueOnce(new Response(null, { status: 402 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }));

    const result = await runMalformedPaymentRejectedCheck({
      target: "http://localhost:4123/protected",
      malformedHeaders: malformedPaymentHeaders,
      fetchImpl,
    });

    expect(result.status).toBe("pass");
    expect(result.summary).toContain("rejected");
  });

  it("fails when a malformed payment attempt is accepted", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 402 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }))
      .mockResolvedValueOnce(new Response(null, { status: 402 }));

    const result = await runMalformedPaymentRejectedCheck({
      target: "http://localhost:4123/protected",
      malformedHeaders: malformedPaymentHeaders,
      fetchImpl,
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("200");
  });

  it("fails when a malformed payment attempt returns a server error", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 402 }))
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }))
      .mockResolvedValueOnce(new Response(null, { status: 402 }));

    const result = await runMalformedPaymentRejectedCheck({
      target: "http://localhost:4123/protected",
      malformedHeaders: malformedPaymentHeaders,
      fetchImpl,
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("500");
  });

  it("fails when a malformed payment attempt is redirected instead of rejected", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 402 }))
      .mockResolvedValueOnce(new Response(null, { status: 302 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }))
      .mockResolvedValueOnce(new Response(null, { status: 402 }));

    const result = await runMalformedPaymentRejectedCheck({
      target: "http://localhost:4123/protected",
      malformedHeaders: malformedPaymentHeaders,
      fetchImpl,
    });

    expect(result.status).toBe("fail");
    expect(result.summary).toContain("302");
  });
});
