import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { validateUrl } from "../utils/validate.js";
import { validatePrompt } from "../ai/guardrails/input.js";
import { runAgentLoop, type StepUpdate } from "../agent/loop.js";

const agent = new Hono();

agent.post("/run", async (c) => {
  const body = await c.req.json<{
    url: string;
    flowDescription: string;
    expectedResult: string;
  }>();

  const { url, flowDescription, expectedResult } = body;

  if (!url || !flowDescription || !expectedResult) {
    return c.json(
      {
        error: "Missing required fields: url, flowDescription, expectedResult",
      },
      400,
    );
  }

  const urlValidation = validateUrl(url);
  if (!urlValidation.valid) {
    return c.json({ error: `Invalid URL: ${urlValidation.reason}` }, 400);
  }

  const flowValidation = validatePrompt(flowDescription);
  if (!flowValidation.valid) {
    return c.json(
      { error: `Invalid flow description: ${flowValidation.reason}` },
      400,
    );
  }

  const expectedValidation = validatePrompt(expectedResult);
  if (!expectedValidation.valid) {
    return c.json(
      { error: `Invalid expected result: ${expectedValidation.reason}` },
      400,
    );
  }

  return streamSSE(c, async (stream) => {
    const sendEvent = async (event: string, data: unknown) => {
      await stream.writeSSE({
        event,
        data: JSON.stringify(data),
      });
    };

    await sendEvent("start", {
      url,
      flowDescription,
      expectedResult,
    });

    const result = await runAgentLoop(
      url,
      flowDescription,
      expectedResult,
      async (update: StepUpdate) => {
        await sendEvent("step", {
          step: update.step,
          phase: update.phase,
          action: update.action,
          thinking: update.thinking,
          result: update.result,
          screenshot: update.screenshot
            ? update.screenshot.toString("base64")
            : undefined,
        });
      },
    );

    await sendEvent("complete", {
      success: result.success,
      summary: result.summary,
      error: result.error,
      totalSteps: result.steps.length / 3,
    });
  });
});

export default agent;
