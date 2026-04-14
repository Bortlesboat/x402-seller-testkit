import type { RunProfile } from "../core/types.js";

export const localMockProfile: RunProfile = {
  id: "local-mock",
  paidMode: "mock",
  checks: [
    "challenge-shape",
    "payment-requirements-parse",
    "malformed-payment-rejected",
    "success-path",
  ],
  requiresPaymentEnv: false,
  defaultPath: "/protected",
};
