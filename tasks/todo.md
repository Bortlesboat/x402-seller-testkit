# Todo

- [x] Create standalone repo skeleton and root toolchain files
- [x] Write failing core config tests
- [x] Write failing report summary tests
- [x] Run focused tests to verify the red state
- [x] Implement minimal config/profile/report modules
- [x] Re-run focused tests to reach green
- [x] Commit the bootstrap contract
- [x] Write failing `challenge-shape` tests
- [x] Run focused `challenge-shape` tests to verify the red state
- [x] Implement minimal header helpers and `challenge-shape`
- [x] Run focused verification for completed slices
- [x] Commit the `challenge-shape` slice
- [x] Write failing `payment-requirements-parse` tests
- [x] Run focused `payment-requirements-parse` tests to verify the red state
- [x] Implement `payment-requirements-parse`
- [x] Re-run focused `payment-requirements-parse` tests to reach green
- [x] Commit the `payment-requirements-parse` slice
- [x] Write failing CLI runner tests
- [x] Run focused CLI runner tests to verify the red state
- [x] Implement minimal CLI args parsing and check runner
- [x] Re-run focused CLI runner tests to reach green
- [x] Run focused multi-file verification for the runner slice
- [x] Commit the CLI runner slice
- [x] Write failing `malformed-payment-rejected` tests
- [x] Run focused `malformed-payment-rejected` tests to verify the red state
- [x] Implement `malformed-payment-rejected`
- [x] Re-run focused `malformed-payment-rejected` tests to reach green
- [x] Integrate `malformed-payment-rejected` into the shared runner
- [x] Write failing `success-path` tests
- [x] Run focused `success-path` tests to verify the red state
- [x] Implement the deterministic local mock seller and facilitator example
- [x] Implement `success-path`
- [x] Re-run focused `success-path` tests to reach green
- [x] Re-run the focused multi-check suite
- [x] Add a runnable local example entrypoint and README usage notes
- [x] Commit the malformed-payment and success-path slice
- [x] Review the repo for credibility, packaging, and GitHub readiness gaps
- [x] Restore working repo quality gates (`lint:check`, `format:check`)
- [x] Add professional GitHub surfaces (`.github` workflow/templates, contribution/security docs)
- [x] Tighten package metadata and repo hygiene for public presentation

## Publishability cleanup (2026-04-13)

- [x] Audit the repo for GitHub-hostile local path leakage and rough presentation edges
- [x] Replace publish-facing absolute local links with repo-safe relative links
- [x] Re-run the full quality gates after the docs cleanup and decide whether the repo is ready to publish or should stay parked locally
- [x] Park public publication until the repo has an intentional remote/default-branch shape and an explicit license/visibility decision

## Public repo launch (2026-04-13)

- [x] Choose the public repo shape and license instead of leaving publication ambiguous
- [ ] Create a clean default branch from the current seller testkit state
- [ ] Create the GitHub repo and push the publish-ready history
- [ ] Verify the public repo metadata and default branch state
