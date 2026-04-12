export const malformedPaymentHeaders: Array<Record<string, string>> = [
  {},
  {
    "PAYMENT-SIGNATURE": "not-base64"
  },
  {
    "PAYMENT-SIGNATURE": Buffer.from("{bad json", "utf8").toString("base64")
  }
];
