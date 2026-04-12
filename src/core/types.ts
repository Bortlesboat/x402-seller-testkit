export type CheckStatus = "pass" | "fail" | "skip";

export type CheckResult = {
  id: string;
  status: CheckStatus;
  summary: string;
  fix?: string;
};

export type RunProfileId = "local-mock" | "basic-evm";

export type RunProfile = {
  id: RunProfileId;
  paidMode: "mock" | "evm";
  checks: string[];
  requiresPaymentEnv: boolean;
  defaultPath: string;
};

export type PaymentConfig = {
  mode: "mock" | "evm";
  ready: boolean;
  missing: string[];
  facilitatorUrl?: string;
  walletAddress?: string;
  walletPrivateKey?: string;
};

export type RunConfig = {
  target: string;
  path: string;
  profile: RunProfile;
  payment: PaymentConfig;
};

export type ResolveRunConfigInput = {
  target: string;
  profile: string;
};

export type RunSummaryInput = {
  target: string;
  profile: RunProfileId;
  results: CheckResult[];
};

export type RunSummary = {
  target: string;
  profile: RunProfileId;
  counts: {
    pass: number;
    fail: number;
    skip: number;
  };
  results: CheckResult[];
  nextFix: string;
};
