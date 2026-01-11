import { runAgentLoop } from "./agent/loop.js";
import { generateUUIDv7 } from "./utils/uuid.js";
import type { StepUpdate } from "./types/index.js";

async function main() {
  const url = "https://github.com/login";
  const flowDescription = "Try to click the 'Create an account' button";
  const expectedResult = "Navigate to the sign up page";

  console.log("Starting UX Agent...");
  console.log(`URL: ${url}`);
  console.log(`Flow: ${flowDescription}`);
  console.log(`Expected: ${expectedResult}`);
  console.log("---");

  const runId = generateUUIDv7();

  const result = await runAgentLoop(
    runId,
    url,
    flowDescription,
    expectedResult,
    "autonomous",
    (update: StepUpdate) => {
      console.log(`[Step ${update.step}] ${update.phase.toUpperCase()}`);

      if (update.phase === "thinking" && update.thinking) {
        console.log(`  Thinking: ${update.thinking}`);
      }

      if (update.phase === "acting" && update.action) {
        console.log(`  Action: ${update.action.action}`);
        console.log(`  Args: ${JSON.stringify(update.action.args)}`);
      }

      if (update.phase === "result" && update.result) {
        console.log(`  Result: ${update.result}`);
      }
    },
  );

  console.log("---");
  console.log(`Success: ${result.success}`);
  console.log(`Summary: ${result.summary}`);
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  console.log(`Total steps: ${result.steps.length / 3}`);
}

main();