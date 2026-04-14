import {
  decodePaymentRequiredHeader,
  decodePaymentResponseHeader,
  encodePaymentSignatureHeader,
} from "@x402/core/http";
import { parsePaymentRequired } from "@x402/core/schemas";

import type { CheckResult, PaymentConfig } from "../core/types.js";
import { buildLocalMockPaymentPayload } from "../fixtures/local-mock.js";

type SuccessPathCheckInput = {
  target: string;
  payment: PaymentConfig;
  paymentRequired?: unknown;
  fetchImpl?: typeof fetch;
};

function buildFailure(
  summary: string,
  fix: string,
  evidence?: unknown,
): CheckResult {
  return {
    id: "success-path",
    status: "fail",
    summary,
    fix,
    evidence,
  };
}

export async function runSuccessPathCheck(
  input: SuccessPathCheckInput,
): Promise<CheckResult> {
  if (input.payment.mode !== "mock") {
    return {
      id: "success-path",
      status: "skip",
      summary:
        "Skipped because only the local mock paid path is implemented today",
      fix: "Add a real EVM payment client before enabling the paid success path for this profile.",
    };
  }

  let paymentRequired = input.paymentRequired;
  const fetchImpl = input.fetchImpl ?? fetch;

  if (!paymentRequired) {
    const unpaidResponse = await fetchImpl(input.target);
    if (unpaidResponse.status !== 402) {
      return buildFailure(
        `Expected an unpaid probe to return 402 before the paid request but received ${unpaidResponse.status}`,
        "Return a 402 challenge for unpaid requests before testing the paid success path.",
      );
    }

    const paymentRequiredHeader =
      unpaidResponse.headers.get("PAYMENT-REQUIRED");
    if (!paymentRequiredHeader) {
      return buildFailure(
        "Unpaid probe returned 402 but PAYMENT-REQUIRED header was missing",
        "Include a valid PAYMENT-REQUIRED header on unpaid responses before testing the paid path.",
      );
    }

    try {
      paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return buildFailure(
        `Invalid PAYMENT-REQUIRED header during success-path probe: ${message}`,
        "Encode a valid PAYMENT-REQUIRED header before attempting the paid success path.",
      );
    }
  }

  const parsed = parsePaymentRequired(paymentRequired);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "paymentRequired";
    return buildFailure(
      `Cannot execute paid request because the challenge payload is invalid at ${path}`,
      "Return a schema-valid PAYMENT-REQUIRED payload before attempting the paid success path.",
    );
  }

  if (parsed.data.x402Version !== 2) {
    return buildFailure(
      "Local mock success-path only supports x402 version 2 challenges",
      "Return an x402 version 2 PAYMENT-REQUIRED payload for the local mock profile.",
    );
  }

  const paymentPayload = buildLocalMockPaymentPayload(parsed.data.resource);
  const response = await fetchImpl(input.target, {
    headers: {
      "PAYMENT-SIGNATURE": encodePaymentSignatureHeader(paymentPayload),
    },
  });

  if (response.status < 200 || response.status >= 300) {
    return buildFailure(
      `Expected a paid request to succeed but received ${response.status}`,
      "Accept a valid PAYMENT-SIGNATURE header and return the protected resource.",
      { status: response.status },
    );
  }

  const paymentResponseHeader = response.headers.get("PAYMENT-RESPONSE");
  if (!paymentResponseHeader) {
    return buildFailure(
      "Paid request succeeded but PAYMENT-RESPONSE header was missing",
      "Return a PAYMENT-RESPONSE header after a successful paid request.",
    );
  }

  try {
    const settlement = decodePaymentResponseHeader(paymentResponseHeader);
    const accepted = parsed.data.accepts[0];

    if (!settlement.success) {
      return buildFailure(
        "Paid request returned a failed settlement response",
        "Settle successful payments and return a success PAYMENT-RESPONSE payload.",
        settlement,
      );
    }

    if (settlement.network !== accepted.network) {
      return buildFailure(
        `Settlement network ${settlement.network} did not match the challenged network ${accepted.network}`,
        "Return a PAYMENT-RESPONSE header whose network matches the accepted payment requirement.",
        settlement,
      );
    }

    if (settlement.amount !== accepted.amount) {
      return buildFailure(
        `Settlement amount ${settlement.amount} did not match the challenged amount ${accepted.amount}`,
        "Return a PAYMENT-RESPONSE header whose amount matches the accepted payment requirement.",
        settlement,
      );
    }

    return {
      id: "success-path",
      status: "pass",
      summary:
        "Paid request succeeded and returned a valid PAYMENT-RESPONSE header",
      evidence: settlement,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return buildFailure(
      `Invalid PAYMENT-RESPONSE header: ${message}`,
      "Encode a schema-valid PAYMENT-RESPONSE header after successful settlement.",
    );
  }
}
