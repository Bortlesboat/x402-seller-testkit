import { decodePaymentRequiredHeader } from "@x402/core/http";
import { validatePaymentRequired } from "@x402/core/schemas";

export function decodeAndValidatePaymentRequiredHeader(headerValue: string) {
  const decoded = decodePaymentRequiredHeader(headerValue);
  return validatePaymentRequired(decoded);
}
