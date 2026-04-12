import type { CheckResult } from "../core/types.js";
import { decodeAndValidatePaymentRequiredHeader } from "../core/headers.js";

type ChallengeShapeCheckInput = {
  target: string;
  fetchImpl?: typeof fetch;
};

function buildFailure(summary: string, fix: string): CheckResult {
  return {
    id: "challenge-shape",
    status: "fail",
    summary,
    fix
  };
}

export async function runChallengeShapeCheck(
  input: ChallengeShapeCheckInput,
): Promise<CheckResult> {
  const fetchImpl = input.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(input.target);

    if (response.status !== 402) {
      return buildFailure(
        `Expected 402 Payment Required but received ${response.status}`,
        "Return a 402 response for unpaid requests.",
      );
    }

    const paymentRequiredHeader = response.headers.get("PAYMENT-REQUIRED");

    if (!paymentRequiredHeader) {
      return buildFailure(
        "402 response missing PAYMENT-REQUIRED header",
        "Include a valid PAYMENT-REQUIRED header on 402 responses.",
      );
    }

    try {
      decodeAndValidatePaymentRequiredHeader(paymentRequiredHeader);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const summary = message.toLowerCase().includes("invalid payment required header")
        ? `Invalid PAYMENT-REQUIRED header: ${message}`
        : `Invalid PAYMENT-REQUIRED schema: ${message}`;

      return buildFailure(
        summary,
        "Encode a schema-valid PAYMENT-REQUIRED header before returning 402.",
      );
    }

    return {
      id: "challenge-shape",
      status: "pass",
      summary: "402 returned with a valid PAYMENT-REQUIRED header",
      evidence: decodeAndValidatePaymentRequiredHeader(paymentRequiredHeader)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return buildFailure(
      `Unpaid probe failed before receiving a response: ${message}`,
      "Make sure the target server is reachable and returns an HTTP response.",
    );
  }
}
