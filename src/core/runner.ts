import type { CheckResult, RunConfig } from "./types.js";
import { runChallengeShapeCheck } from "../checks/challenge-shape.js";
import { runMalformedPaymentRejectedCheck } from "../checks/malformed-payment-rejected.js";
import { runPaymentRequirementsParseCheck } from "../checks/payment-requirements-parse.js";
import { runSuccessPathCheck } from "../checks/success-path.js";
import { malformedPaymentHeaders } from "../fixtures/malformed-payment.js";

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
    await runMalformedPaymentRejectedCheck({
      target: config.target,
      malformedHeaders: malformedPaymentHeaders,
      fetchImpl: deps.fetchImpl
    }),
  );

  if (challengeResult.status !== "pass" || !challengeResult.evidence) {
    results.push(
      buildSkip(
        "success-path",
        "Skipped because challenge-shape did not produce a valid PAYMENT-REQUIRED payload",
        challengeResult.fix,
      ),
    );
  } else if (!config.payment.ready) {
    results.push(
      buildSkip(
        "success-path",
        "Skipped because payment env is missing for this profile",
        "Provide facilitator and wallet env before running the paid success path.",
      ),
    );
  } else {
    results.push(
      await runSuccessPathCheck({
        target: config.target,
        payment: config.payment,
        paymentRequired: challengeResult.evidence,
        fetchImpl: deps.fetchImpl
      }),
    );
  }

  return results;
}
