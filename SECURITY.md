# Security Policy

## Reporting a Vulnerability

Please do not open public GitHub issues for security-sensitive bugs.

If you find a vulnerability involving payment validation, facilitator interactions, malformed request handling, or secret management, share a private report with:

- a concise summary
- affected files or flows
- reproduction steps
- expected impact

Until a dedicated security contact is published for this repo, route reports through the maintainer directly and avoid disclosing exploit details publicly.

## Scope

Security-relevant areas for this project include:

- payment header parsing and validation
- seller acceptance and rejection behavior
- facilitator verification and settlement flows
- environment variable handling for paid profiles
- CI or packaging changes that alter what gets executed

## Response Expectations

The goal is to acknowledge credible reports quickly, reproduce them locally, and ship a fix with regression coverage before public disclosure when possible.
