# x402 Seller Testkit

Seller-side x402 conformance and regression harness.

`x402-seller-testkit` gives us a fast way to verify the things that make a seller feel real instead of "it returned 402 once on my laptop."

Current checks:

- `challenge-shape`: unpaid requests return `402` with a valid `PAYMENT-REQUIRED` header
- `payment-requirements-parse`: the advertised payment requirements are schema-valid and usable
- `malformed-payment-rejected`: obviously bad `PAYMENT-SIGNATURE` attempts are rejected with client errors
- `success-path`: a deterministic local mock payment succeeds and returns a valid `PAYMENT-RESPONSE`

Profiles:

- `local-mock`: deterministic paid-path coverage with no wallet or facilitator secrets
- `basic-evm`: challenge-path coverage today, with env-gated paid-path support reserved for the next slice

## Quick Start

```bash
pnpm install
pnpm typecheck
pnpm test
```

## Run The Local Example

Start the bundled mock facilitator and seller:

```bash
pnpm example:local
```

The process prints the protected route and the exact CLI command to run against it.

## Run The Harness

```bash
pnpm exec tsx src/cli/run.ts run --target http://127.0.0.1:4123/protected --profile local-mock
```

Optional report output:

```bash
pnpm exec tsx src/cli/run.ts run --target http://127.0.0.1:4123/protected --profile local-mock --report-json reports/local-mock.json
```

## Repo Notes

- The project uses `NodeNext`, so relative TypeScript imports intentionally use explicit `.js` extensions.
- The local mock example lives in [examples/local-express/main.ts](/C:/Users/andre/OneDrive/Documents/Github/x402-seller-testkit/examples/local-express/main.ts).
- JSON reports are written into [reports/.gitkeep](/C:/Users/andre/OneDrive/Documents/Github/x402-seller-testkit/reports/.gitkeep)'s directory.
