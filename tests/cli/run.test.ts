import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";
import { encodePaymentRequiredHeader, encodePaymentResponseHeader } from "@x402/core/http";
import type { PaymentRequired, SettleResponse } from "@x402/core/types";

import { runCli } from "../../src/cli/run.js";

const reportPath = join(process.cwd(), "reports", "cli-test-report.json");

const validPaymentRequired: PaymentRequired = {
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
};

const validSettleResponse: SettleResponse = {
  success: true,
  payer: "mock-payer",
  transaction: "0xmocksettlement",
  network: "mock:local",
  amount: "10000"
};

function createHappyPathFetchMock() {
  return vi
    .fn()
    .mockResolvedValueOnce(
      new Response(null, {
        status: 402,
        headers: {
          "PAYMENT-REQUIRED": encodePaymentRequiredHeader(validPaymentRequired)
        }
      }),
    )
    .mockResolvedValueOnce(new Response(null, { status: 402 }))
    .mockResolvedValueOnce(new Response(null, { status: 400 }))
    .mockResolvedValueOnce(new Response(null, { status: 402 }))
    .mockResolvedValueOnce(new Response(null, { status: 400 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "PAYMENT-RESPONSE": encodePaymentResponseHeader(validSettleResponse)
        }
      }),
    );
}

afterEach(async () => {
  await rm(reportPath, { force: true });
});

describe("runCli", () => {
  it("requires both --target and --profile", async () => {
    const lines: string[] = [];

    const exitCode = await runCli(["run"], {
      fetchImpl: vi.fn(),
      writeLine: (line) => lines.push(line)
    });

    expect(exitCode).toBe(1);
    expect(lines.join("\n")).toContain("--target");
    expect(lines.join("\n")).toContain("--profile");
  });

  it("runs challenge-shape and payment-requirements-parse in order", async () => {
    const lines: string[] = [];
    const fetchImpl = createHappyPathFetchMock();

    const exitCode = await runCli(
      ["run", "--target", "http://localhost:4123/protected", "--profile", "local-mock"],
      {
        fetchImpl,
        writeLine: (line) => lines.push(line)
      },
    );

    const output = lines.join("\n");

    expect(exitCode).toBe(0);
    expect(output).toContain("challenge-shape: pass");
    expect(output).toContain("payment-requirements-parse: pass");
    expect(output).toContain("malformed-payment-rejected: pass");
    expect(output).toContain("success-path: pass");
  });

  it("writes a JSON report when --report-json is provided", async () => {
    const fetchImpl = createHappyPathFetchMock();

    const exitCode = await runCli(
      [
        "run",
        "--target",
        "http://localhost:4123/protected",
        "--profile",
        "local-mock",
        "--report-json",
        reportPath
      ],
      {
        fetchImpl,
        writeLine: vi.fn()
      },
    );

    const rawReport = await readFile(reportPath, "utf8");
    const report = JSON.parse(rawReport);

    expect(exitCode).toBe(0);
    expect(report.target).toBe("http://localhost:4123/protected");
    expect(report.profile).toBe("local-mock");
    expect(report.results[0].id).toBe("challenge-shape");
  });

  it("produces skip results instead of crashing when payment env is missing", async () => {
    const lines: string[] = [];
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 402,
        headers: {
          "PAYMENT-REQUIRED": encodePaymentRequiredHeader(validPaymentRequired)
        }
      }),
    );

    const exitCode = await runCli(
      ["run", "--target", "http://localhost:4123/protected", "--profile", "basic-evm"],
      {
        fetchImpl,
        writeLine: (line) => lines.push(line)
      },
    );

    expect(exitCode).toBe(0);
    expect(lines.join("\n")).toContain("success-path: skip");
  });
});
