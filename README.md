# x402 Seller Testkit

Seller-side x402 conformance and regression harness.

`x402-seller-testkit` is for the boring-but-important question that decides whether a seller implementation is credible: does it consistently challenge, reject bad payments, and settle a valid paid request the way downstream buyers expect?

## What It Covers Today

- `challenge-shape`: unpaid requests return `402` with a valid `PAYMENT-REQUIRED` header
- `payment-requirements-parse`: advertised payment requirements are schema-valid and usable
- `malformed-payment-rejected`: malformed `PAYMENT-SIGNATURE` attempts are rejected with explicit client errors
- `success-path`: a deterministic local mock payment succeeds and returns a valid `PAYMENT-RESPONSE`

## Profiles

- `local-mock`: deterministic paid-path coverage with no wallet or facilitator secrets
- `basic-evm`: challenge-path coverage today, with env-gated paid-path coverage reserved for the next slice

## Quick Start

```bash
pnpm install
pnpm check
```

## Run The Local Example

The bundled example starts a mock facilitator and a protected seller route:

```bash
pnpm example:local
```

It prints a live protected URL and the exact harness command to run against it.

## Run The Harness

With the example running in another terminal:

```bash
pnpm exec tsx src/cli/run.ts run --target http://127.0.0.1:38509/protected --profile local-mock
```

Write a JSON report:

```bash
pnpm exec tsx src/cli/run.ts run --target http://127.0.0.1:38509/protected --profile local-mock --report-json reports/local-mock.json
```

Build the distributable CLI:

```bash
pnpm build
node dist/cli/run.js run --target http://127.0.0.1:38509/protected --profile local-mock
```

## Repo Quality Gates

```bash
pnpm typecheck
pnpm lint:check
pnpm format:check
pnpm test
```

CI runs the same gates on every push and pull request.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the expected development loop and verification steps.

## Security

See [SECURITY.md](./SECURITY.md) for private disclosure guidance.

## Notes

- The project uses `NodeNext`, so relative TypeScript imports intentionally use explicit `.js` extensions.
- The local mock example lives in [examples/local-express/main.ts](./examples/local-express/main.ts).
- JSON reports are written into the [reports](./reports/) directory.
