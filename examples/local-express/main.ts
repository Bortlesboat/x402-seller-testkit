import { startMockFacilitator } from "./mock-facilitator.js";
import { startLocalExpressServer } from "./server.js";

const facilitator = await startMockFacilitator();
const seller = await startLocalExpressServer({
  facilitatorUrl: facilitator.baseUrl
});

console.log(`mock facilitator: ${facilitator.baseUrl}`);
console.log(`local seller: ${seller.baseUrl}/protected`);
console.log(
  `run the harness: pnpm exec tsx src/cli/run.ts run --target ${seller.baseUrl}/protected --profile local-mock`,
);

async function shutdown() {
  await seller.close();
  await facilitator.close();
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
