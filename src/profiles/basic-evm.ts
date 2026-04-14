import type { RunProfile } from "../core/types.js";

export const basicEvmProfile: RunProfile = {
  id: "basic-evm",
  paidMode: "evm",
  checks: [
    "challenge-shape",
    "payment-requirements-parse",
    "malformed-payment-rejected",
    "success-path",
  ],
  requiresPaymentEnv: true,
  defaultPath: "/",
};
