# Lessons

- For a first-time public repo launch from a local git tree, cut a normal `main` branch before running `gh repo create --source <path> --remote origin --push`. That keeps the remote default branch clean instead of publishing a temporary local feature-branch name.
- Before publishing repo docs, grep for absolute local Markdown links and replace them with relative repo paths. The README looked fine locally, but hardcoded `C:/...` links would have leaked machine-specific paths and looked broken on GitHub.
- The installed `@x402/core` package exposes HTTP header helpers from `@x402/core/http`, not reliably from the package root. Use the subpath import for `encodePaymentRequiredHeader` and related helpers.
- `NodeNext` TypeScript repos need explicit `.js` extensions on relative imports, including tests and example entrypoints, if we want `tsc --noEmit` to stay green.
- ESLint v9 needs a flat `eslint.config.*` file, and type-aware linting only works when example entrypoints are included in the repo `tsconfig.json`.
