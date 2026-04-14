import type { CheckResult } from "../core/types.js";

type MalformedPaymentRejectedCheckInput = {
  target: string;
  malformedHeaders: Array<Record<string, string>>;
  fetchImpl?: typeof fetch;
};

function buildFailure(summary: string, evidence: unknown): CheckResult {
  return {
    id: "malformed-payment-rejected",
    status: "fail",
    summary,
    fix: "Reject malformed PAYMENT-SIGNATURE requests with 400 or 402 responses.",
    evidence,
  };
}

export async function runMalformedPaymentRejectedCheck(
  input: MalformedPaymentRejectedCheckInput,
): Promise<CheckResult> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const statuses: number[] = [];

  const baseline = await fetchImpl(input.target);
  if (baseline.status !== 402) {
    return buildFailure(
      `Expected an unpaid baseline probe to return 402 but received ${baseline.status}`,
      { baselineStatus: baseline.status },
    );
  }

  for (const headers of input.malformedHeaders) {
    const response = await fetchImpl(input.target, {
      headers,
    });

    statuses.push(response.status);

    if (response.status === 400 || response.status === 402) {
      continue;
    }

    if (response.status >= 200 && response.status < 300) {
      return buildFailure(
        `Malformed payment was accepted with status ${response.status}`,
        { statuses },
      );
    }

    if (response.status >= 300 && response.status < 500) {
      return buildFailure(
        `Malformed payment was redirected or returned an unexpected client status ${response.status}`,
        { statuses },
      );
    }

    if (response.status >= 500) {
      return buildFailure(
        `Malformed payment triggered a server error with status ${response.status}`,
        { statuses },
      );
    }
  }

  return {
    id: "malformed-payment-rejected",
    status: "pass",
    summary: "All malformed payment attempts were rejected with client errors",
    evidence: { statuses },
  };
}
