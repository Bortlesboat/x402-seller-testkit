# Lessons

- The installed `@x402/core` package exposes HTTP header helpers from `@x402/core/http`, not reliably from the package root. Use the subpath import for `encodePaymentRequiredHeader` and related helpers.
- `NodeNext` TypeScript repos need explicit `.js` extensions on relative imports, including tests and example entrypoints, if we want `tsc --noEmit` to stay green.
