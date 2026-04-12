import { afterEach, describe, expect, it } from "vitest";

import { runSuccessPathCheck } from "../../src/checks/success-path.js";
import { startLocalExpressServer } from "../../examples/local-express/server.js";
import { startMockFacilitator } from "../../examples/local-express/mock-facilitator.js";

describe("runSuccessPathCheck", () => {
  let closeSeller: (() => Promise<void>) | undefined;
  let closeFacilitator: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeSeller) {
      await closeSeller();
      closeSeller = undefined;
    }

    if (closeFacilitator) {
      await closeFacilitator();
      closeFacilitator = undefined;
    }
  });

  it("passes against the local mock seller and facilitator", async () => {
    const facilitator = await startMockFacilitator();
    closeFacilitator = facilitator.close;

    const seller = await startLocalExpressServer({
      facilitatorUrl: facilitator.baseUrl
    });
    closeSeller = seller.close;

    const result = await runSuccessPathCheck({
      target: `${seller.baseUrl}/protected`,
      payment: {
        mode: "mock",
        ready: true,
        missing: []
      }
    });

    expect(result.status).toBe("pass");
    expect(result.summary).toContain("PAYMENT-RESPONSE");
  });
});
