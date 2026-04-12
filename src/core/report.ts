import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { CheckResult, RunSummary, RunSummaryInput } from "./types.js";

function countStatuses(results: CheckResult[]) {
  return results.reduce(
    (counts, result) => {
      counts[result.status] += 1;
      return counts;
    },
    { pass: 0, fail: 0, skip: 0 },
  );
}

function chooseNextFix(results: CheckResult[]) {
  const failingFix = results.find((result) => result.status === "fail" && result.fix)?.fix;
  if (failingFix) {
    return failingFix;
  }

  return results.find((result) => result.status === "skip" && result.fix)?.fix ?? "";
}

export function summarizeRun(input: RunSummaryInput): RunSummary {
  return {
    target: input.target,
    profile: input.profile,
    counts: countStatuses(input.results),
    results: input.results,
    nextFix: chooseNextFix(input.results)
  };
}

export async function writeJsonReport(path: string, summary: RunSummary) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(summary, null, 2));
}
