import type { PaymentPayload, PaymentRequired, SettleResponse } from "@x402/core/types";

export const localMockScheme = "exact";
export const localMockNetwork = "mock:local";
export const localMockAmount = "10000";
export const localMockAsset = "mock:usdc";
export const localMockPayTo = "seller:local";
export const localMockPayer = "mock-payer";
export const localMockTransaction = "0xmocksettlement";
export const localMockPayload = {
  signature: "valid-mock-signature",
  invoiceId: "invoice-123"
} as const;

type LocalMockPaymentCandidate = {
  x402Version: 2;
  accepted: {
    scheme: string;
    network: string;
    payTo: string;
    asset: string;
    amount: string;
  };
  payload: Record<string, unknown>;
};

export function buildLocalMockPaymentRequired(
  resourceUrl: string,
  facilitatorUrl: string,
): PaymentRequired {
  return {
    x402Version: 2,
    resource: {
      url: resourceUrl,
      description: "Local mock protected resource",
      mimeType: "application/json"
    },
    accepts: [
      {
        scheme: localMockScheme,
        network: localMockNetwork,
        amount: localMockAmount,
        asset: localMockAsset,
        payTo: localMockPayTo,
        maxTimeoutSeconds: 60,
        extra: {
          facilitatorUrl
        }
      }
    ]
  };
}

export function buildLocalMockPaymentPayload(
  resource: PaymentRequired["resource"],
): PaymentPayload {
  return {
    x402Version: 2,
    resource,
    accepted: {
      scheme: localMockScheme,
      network: localMockNetwork,
      amount: localMockAmount,
      asset: localMockAsset,
      payTo: localMockPayTo,
      maxTimeoutSeconds: 60,
      extra: {}
    },
    payload: { ...localMockPayload }
  };
}

export function buildLocalMockSettleResponse(): SettleResponse {
  return {
    success: true,
    payer: localMockPayer,
    transaction: localMockTransaction,
    network: localMockNetwork,
    amount: localMockAmount
  };
}

export function matchesLocalMockPayload(paymentPayload: LocalMockPaymentCandidate): boolean {
  const payload = paymentPayload.payload;
  return (
    paymentPayload.accepted.scheme === localMockScheme &&
    paymentPayload.accepted.network === localMockNetwork &&
    paymentPayload.accepted.payTo === localMockPayTo &&
    paymentPayload.accepted.asset === localMockAsset &&
    paymentPayload.accepted.amount === localMockAmount &&
    payload.signature === localMockPayload.signature &&
    payload.invoiceId === localMockPayload.invoiceId
  );
}
