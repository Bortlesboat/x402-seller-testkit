import type { CheckResult, RunConfig } from "./types";
import { runChallengeShapeCheck } from "../checks/challenge-shape";
import { runPaymentRequirementsParseCheck } from "../checks/payment-requirements-parse";

type RunnerDeps = {
  fetchImpl?: typeof fetch;
};

function buildSkip(id: string, summary: string, fix?: string): CheckResult {
  return {
    id,
    status: "skip",
    summary,
    fix
  };
}

export async function runChecks(config: RunConfig, deps: RunnerDeps = {}) {
  const results: CheckResult[] = [];

  const challengeResult = await runChallengeShapeCheck({
    target: config.target,
    fetchImpl: deps.fetchImpl
  });
  results.push(challengeResult);

  if (challengeResult.status === "pass" && challengeResult.evidence) {
    results.push(
      runPaymentRequirementsParseCheck({
        paymentRequired: challengeResult.evidence
      }),
    );
  } else {
    results.push(
      buildSkip(
        "payment-requirements-parse",
        "Skipped because challenge-shape did not produce a valid PAYMENT-REQUIRED payload",
        challengeResult.fix,
      ),
    );
  }

  results.push(
    buildSkip(
      "malformed-payment-rejected",
      "Skipped until malformed-payment-rejected is implemented",
      "Add malformed PAYMENT-SIGNATURE coverage.",
    ),
  );

  if (!config.payment.ready) {
    results.push(
      buildSkip(
        "success-path",
        "Skipped because payment env is missing for this profile",
        "Provide facilitator and wallet env before running the paid success path.",
      ),
    );
  } else {
    results.push(
      buildSkip(
        "success-path",
        "Skipped until success-path is implemented",
        "Implement the paid-path runner for this profile.",
      ),
    );
  }

  return results;
}
