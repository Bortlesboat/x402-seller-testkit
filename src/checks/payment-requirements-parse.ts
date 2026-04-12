import { parsePaymentRequired } from "@x402/core/schemas";

import type { CheckResult } from "../core/types";

type PaymentRequirementsParseCheckInput = {
  paymentRequired: unknown;
};

function buildFailure(summary: string): CheckResult {
  return {
    id: "payment-requirements-parse",
    status: "fail",
    summary,
    fix: "Return a schema-valid PAYMENT-REQUIRED payload with usable seller metadata."
  };
}

export function runPaymentRequirementsParseCheck(
  input: PaymentRequirementsParseCheckInput,
): CheckResult {
  const parsed = parsePaymentRequired(input.paymentRequired);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "paymentRequired";
    const message = issue?.message || "Unknown schema error";
    return buildFailure(`Invalid payment requirements schema at ${path}: ${message}`);
  }

  for (const requirement of parsed.data.accepts) {
    const facilitatorUrl = requirement.extra?.facilitatorUrl;
    if (typeof facilitatorUrl === "string") {
      try {
        new URL(facilitatorUrl);
      } catch {
        return buildFailure(`Invalid facilitator URL in payment requirements: ${facilitatorUrl}`);
      }
    }
  }

  return {
    id: "payment-requirements-parse",
    status: "pass",
    summary: `Parsed ${parsed.data.accepts.length} accepts entries successfully`
  };
}
