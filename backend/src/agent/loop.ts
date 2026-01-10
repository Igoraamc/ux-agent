import { createPlaywrightAdapter } from "../browser/playwright.js";
import { createBrowserService } from "../browser/browser-service.js";
import { createClaudeAgent } from "../ai/claude.js";
import { annotateScreenshot } from "./annotator.js";
import { persistStep, updateRunStatus, createRun } from "./persistence.js";
import { executeAction } from "./executor.js";
import type { AgentResult, StepUpdate } from "../types/index.js";

const MAX_STEPS = 15;

type OnStepUpdate = (update: StepUpdate) => void;

export async function runAgentLoop(
  runId: string,
  url: string,
  flowDescription: string,
  expectedResult: string,
  onStepUpdate?: OnStepUpdate,
): Promise<AgentResult> {
  const adapter = createPlaywrightAdapter();
  const browser = createBrowserService(adapter);
  const claude = createClaudeAgent();

  const steps: StepUpdate[] = [];
  const actionHistory: string[] = [];
  let stepNumber = 0;

  const emitUpdate = async (
    update: StepUpdate,
    durationMs: number,
    screenshot?: Buffer,
  ) => {
    steps.push(update);
    onStepUpdate?.(update);

    await persistStep(runId, update.step, update.phase, durationMs, {
      thinking: update.thinking,
      action: update.action,
      result: update.result,
      screenshot,
    });
  };

  try {
    await createRun({
      id: runId,
      url,
      flowDescription,
      expectedResult,
      mode: "autonomous",
      status: "running",
    });

    await browser.initialize();
    await browser.goto(url);

    while (stepNumber < MAX_STEPS) {
      stepNumber++;
      let phaseStart = Date.now();

      const screenshot = await browser.screenshot();
      const elements = await browser.getInteractiveElements();
      const annotated = await annotateScreenshot(screenshot, elements);

      const response = await claude.getNextAction(
        annotated,
        elements,
        flowDescription,
        expectedResult,
        actionHistory,
      );

      await emitUpdate(
        {
          step: stepNumber,
          phase: "thinking",
          thinking: response.thinking,
          screenshot: annotated,
        },
        Date.now() - phaseStart,
        annotated,
      );

      phaseStart = Date.now();
      await emitUpdate(
        {
          step: stepNumber,
          phase: "acting",
          action: response.action,
        },
        Date.now() - phaseStart,
      );

      phaseStart = Date.now();
      const result = await executeAction(browser, response.action, elements);

      actionHistory.push(result);

      await emitUpdate(
        {
          step: stepNumber,
          phase: "result",
          result,
        },
        Date.now() - phaseStart,
      );

      if (response.action.action === "done") {
        const args = response.action.args as {
          summary: string;
          expected_result_achieved: boolean;
        };
        await browser.close();
        const agentResult: AgentResult = {
          success: args.expected_result_achieved,
          steps,
          summary: args.summary,
        };
        await updateRunStatus(runId, "completed", agentResult);
        return agentResult;
      }

      if (response.action.action === "fail") {
        const args = response.action.args as {
          reason: string;
          blocker: string;
        };
        await browser.close();
        const agentResult: AgentResult = {
          success: false,
          steps,
          summary: `Test failed: ${args.reason}. Blocker: ${args.blocker}`,
        };
        await updateRunStatus(runId, "failed", agentResult);
        return agentResult;
      }
    }

    await browser.close();
    const agentResult: AgentResult = {
      success: false,
      steps,
      summary: `Test stopped after reaching ${MAX_STEPS} step limit`,
    };
    await updateRunStatus(runId, "failed", agentResult);
    return agentResult;
  } catch (error) {
    await browser.close().catch(() => {});
    const errorMessage = error instanceof Error ? error.message : String(error);
    const agentResult: AgentResult = {
      success: false,
      steps,
      summary: "Test failed due to error",
      error: errorMessage,
    };
    await updateRunStatus(runId, "failed", agentResult);
    return agentResult;
  }
}