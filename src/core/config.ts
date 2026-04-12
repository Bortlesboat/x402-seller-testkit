import { ConfigError } from "./errors";
import type { PaymentConfig, ResolveRunConfigInput, RunConfig, RunProfile } from "./types";
import { basicEvmProfile } from "../profiles/basic-evm";
import { localMockProfile } from "../profiles/local-mock";

const profiles: Record<string, RunProfile> = {
  "local-mock": localMockProfile,
  "basic-evm": basicEvmProfile
};

const evmEnvVars = [
  "FACILITATOR_URL",
  "X402_WALLET_ADDRESS",
  "X402_WALLET_PRIVATE_KEY"
] as const;

function resolvePaymentConfig(profile: RunProfile): PaymentConfig {
  if (profile.paidMode === "mock") {
    return {
      mode: "mock",
      ready: true,
      missing: []
    };
  }

  const facilitatorUrl = process.env.FACILITATOR_URL;
  const walletAddress = process.env.X402_WALLET_ADDRESS;
  const walletPrivateKey = process.env.X402_WALLET_PRIVATE_KEY;
  const missing = evmEnvVars.filter((key) => !process.env[key]);

  return {
    mode: "evm",
    ready: missing.length === 0,
    missing: [...missing],
    facilitatorUrl,
    walletAddress,
    walletPrivateKey
  };
}

export function resolveRunConfig(input: ResolveRunConfigInput): RunConfig {
  const profile = profiles[input.profile];

  if (!profile) {
    throw new ConfigError(`Unknown profile: ${input.profile}`);
  }

  const url = new URL(input.target);
  const path = url.pathname === "/" ? profile.defaultPath : url.pathname;

  return {
    target: input.target,
    path,
    profile,
    payment: resolvePaymentConfig(profile)
  };
}
