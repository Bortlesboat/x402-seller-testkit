import { describe, expect, it } from "vitest";

import { resolveRunConfig } from "../../src/core/config";

describe("resolveRunConfig", () => {
  it("resolves minimal local-mock config with defaults", () => {
    const config = resolveRunConfig({
      target: "http://localhost:4123/protected",
      profile: "local-mock"
    });

    expect(config.profile.id).toBe("local-mock");
    expect(config.target).toBe("http://localhost:4123/protected");
    expect(config.path).toBe("/protected");
    expect(config.payment.mode).toBe("mock");
    expect(config.payment.ready).toBe(true);
  });

  it("marks basic-evm paid mode as not ready when env is missing", () => {
    const config = resolveRunConfig({
      target: "https://seller.example.com/paid",
      profile: "basic-evm"
    });

    expect(config.profile.id).toBe("basic-evm");
    expect(config.payment.mode).toBe("evm");
    expect(config.payment.ready).toBe(false);
    expect(config.payment.missing).toEqual([
      "FACILITATOR_URL",
      "X402_WALLET_ADDRESS",
      "X402_WALLET_PRIVATE_KEY"
    ]);
  });

  it("throws a typed config error for an unknown profile", () => {
    expect(() =>
      resolveRunConfig({
        target: "http://localhost:3000/protected",
        profile: "unknown-profile"
      }),
    ).toThrowError("Unknown profile: unknown-profile");
  });
});
