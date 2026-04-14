# Contributing

Thanks for helping make `x402-seller-testkit` sharper.

## Local Setup

```bash
pnpm install
pnpm typecheck
pnpm test
```

## Development Loop

1. Add or update a focused test first.
2. Run the smallest relevant test command and watch it fail for the right reason.
3. Implement the smallest fix or feature that makes the test pass.
4. Run the full verification suite before opening a PR.

## Verification

Use these commands before asking for review:

```bash
pnpm typecheck
pnpm lint:check
pnpm format:check
pnpm test
```

## Scope

Good contributions for this repo usually improve one of four things:

- seller-side x402 conformance coverage
- deterministic local examples
- report quality and developer ergonomics
- CI and repo reliability

If you are adding a new check, try to include:

- one passing test
- one failure-mode test
- a clear `fix` message in the report output

## Pull Requests

- Keep changes narrow and evidence-backed.
- Include the verification commands you ran.
- Call out any follow-up work or shortcuts explicitly.
