import { parseArgs } from "./args";
import { resolveRunConfig } from "../core/config";
import { summarizeRun, writeJsonReport } from "../core/report";
import { runChecks } from "../core/runner";

type RunCliDeps = {
  fetchImpl?: typeof fetch;
  writeLine?: (line: string) => void;
};

function renderResult(result: { id: string; status: string; summary: string }) {
  return `${result.id}: ${result.status} - ${result.summary}`;
}

export async function runCli(argv: string[], deps: RunCliDeps = {}) {
  const writeLine = deps.writeLine ?? console.log;
  const parsed = parseArgs(argv);

  if (!parsed.ok) {
    writeLine(parsed.message);
    return 1;
  }

  try {
    const config = resolveRunConfig({
      target: parsed.target,
      profile: parsed.profile
    });

    const results = await runChecks(config, { fetchImpl: deps.fetchImpl });
    const summary = summarizeRun({
      target: config.target,
      profile: config.profile.id,
      results
    });

    for (const result of results) {
      writeLine(renderResult(result));
    }

    if (summary.nextFix) {
      writeLine(`fix this next: ${summary.nextFix}`);
    }

    if (parsed.reportJson) {
      await writeJsonReport(parsed.reportJson, summary);
      writeLine(`report-json: ${parsed.reportJson}`);
    }

    return summary.counts.fail > 0 ? 1 : 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CLI error";
    writeLine(message);
    return 1;
  }
}
