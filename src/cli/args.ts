export type ParsedRunArgs =
  | {
      ok: true;
      command: "run";
      target: string;
      profile: string;
      reportJson?: string;
    }
  | {
      ok: false;
      message: string;
    };

export function parseArgs(argv: string[]): ParsedRunArgs {
  if (argv[0] !== "run") {
    return {
      ok: false,
      message: 'Usage: run --target <url> --profile <profile> [--report-json <path>]'
    };
  }

  let target: string | undefined;
  let profile: string | undefined;
  let reportJson: string | undefined;

  for (let index = 1; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--target") {
      target = next;
      index += 1;
      continue;
    }

    if (current === "--profile") {
      profile = next;
      index += 1;
      continue;
    }

    if (current === "--report-json") {
      reportJson = next;
      index += 1;
    }
  }

  if (!target || !profile) {
    return {
      ok: false,
      message: "Missing required --target and --profile arguments."
    };
  }

  return {
    ok: true,
    command: "run",
    target,
    profile,
    reportJson
  };
}
