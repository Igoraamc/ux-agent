import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { validateUrl } from "../utils/validate.js";
import { validatePrompt } from "../ai/guardrails/input.js";
import { runAgentLoop } from "../agent/loop.js";
import { generateUUIDv7 } from "../utils/uuid.js";
import { logger } from "../lib/logger.js";
import type { StepUpdate, RunMode } from "../types/index.js";
import type { AgentAction } from "../ai/actions.js";

const VALID_MODES: RunMode[] = ["autonomous", "supervised", "manual"];

type PendingApproval = {
  step: number;
  action: AgentAction;
  resolve: (approved: boolean) => void;
};

const pendingApprovals = new Map<string, PendingApproval>();

const agent = new Hono();

agent.post("/run", async (c) => {
  const body = await c.req.json<{
    url: string;
    flowDescription: string;
    expectedResult: string;
    mode?: RunMode;
  }>();

  const { url, flowDescription, expectedResult } = body;
  const mode: RunMode = body.mode ?? "autonomous";

  if (!url || !flowDescription || !expectedResult) {
    return c.json(
      {
        error: "Missing required fields: url, flowDescription, expectedResult",
      },
      400,
    );
  }

  if (!VALID_MODES.includes(mode)) {
    return c.json(
      { error: `Invalid mode: ${mode}. Must be one of: ${VALID_MODES.join(", ")}` },
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

    const runId = generateUUIDv7();

    logger.info({
      runId,
      url,
      flowDescription,
      expectedResult,
      mode,
      source: "api",
    }, "Starting run from API");

    await sendEvent("start", {
      runId,
      url,
      flowDescription,
      expectedResult,
      mode,
    });

    const onStepUpdate = async (update: StepUpdate) => {
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
    };

    const onPause = async (step: number, action: AgentAction, screenshot: Buffer) => {
      await sendEvent("approval_required", {
        step,
        action,
        screenshot: screenshot.toString("base64"),
      });

      return new Promise<void>((resolve, reject) => {
        pendingApprovals.set(runId, {
          step,
          action,
          resolve: (approved: boolean) => {
            pendingApprovals.delete(runId);
            if (approved) {
              resolve();
            } else {
              reject(new Error("Action rejected by user"));
            }
          },
        });
      });
    };

    const result = await runAgentLoop(
      runId,
      url,
      flowDescription,
      expectedResult,
      mode,
      onStepUpdate,
      mode === "manual" ? onPause : undefined,
    );

    await sendEvent("complete", {
      success: result.success,
      summary: result.summary,
      error: result.error,
      totalSteps: result.steps.length / 3,
    });
  });
});

agent.post("/run/:runId/approve", async (c) => {
  const runId = c.req.param("runId");
  const body = await c.req.json<{ approved: boolean }>();

  const pending = pendingApprovals.get(runId);
  if (!pending) {
    return c.json({ error: "No pending approval for this run" }, 404);
  }

  pending.resolve(body.approved);

  return c.json({
    success: true,
    step: pending.step,
    approved: body.approved,
  });
});

agent.get("/run/:runId/pending", async (c) => {
  const runId = c.req.param("runId");
  const pending = pendingApprovals.get(runId);

  if (!pending) {
    return c.json({ pending: false });
  }

  return c.json({
    pending: true,
    step: pending.step,
    action: pending.action,
  });
});

export default agent;
