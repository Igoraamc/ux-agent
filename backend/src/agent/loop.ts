import { createPlaywrightAdapter } from "../browser/playwright.js";
import { createBrowserService } from "../browser/browser-service.js";
import { createClaudeAgent } from "../ai/claude.js";
import { annotateScreenshot } from "./annotator.js";
import { persistStep, updateRunStatus, createRun } from "./persistence.js";
import { executeAction } from "./executor.js";
import { createRunLogger, createStepLogger } from "../lib/logger.js";
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
  const runLog = createRunLogger(runId);
  const runStartTime = Date.now();

  runLog.info({ url, flowDescription, expectedResult }, "Run started");

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
      const stepLog = createStepLogger(runId, stepNumber);
      let phaseStart = Date.now();

      const screenshot = await browser.screenshot();
      const elements = await browser.getInteractiveElements();
      const annotated = await annotateScreenshot(screenshot, elements);

      stepLog.debug(
        { elementsCount: elements.length, durationMs: Date.now() - phaseStart },
        "Screenshot captured",
      );

      phaseStart = Date.now();
      const response = await claude.getNextAction(
        annotated,
        elements,
        flowDescription,
        expectedResult,
        actionHistory,
      );

      stepLog.info(
        {
          action: response.action.action,
          args: response.action.args,
          thinkingLength: response.thinking?.length ?? 0,
          durationMs: Date.now() - phaseStart,
        },
        "Claude responded",
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

      stepLog.info(
        {
          action: response.action.action,
          result,
          durationMs: Date.now() - phaseStart,
        },
        "Action executed",
      );

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
        runLog.info(
          {
            success: args.expected_result_achieved,
            totalSteps: stepNumber,
            durationMs: Date.now() - runStartTime,
            summary: args.summary,
          },
          "Run completed",
        );
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
        runLog.warn(
          {
            totalSteps: stepNumber,
            durationMs: Date.now() - runStartTime,
            reason: args.reason,
            blocker: args.blocker,
          },
          "Run failed by agent",
        );
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
    runLog.warn(
      { maxSteps: MAX_STEPS, durationMs: Date.now() - runStartTime },
      "Run stopped: max steps reached",
    );
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
    runLog.error(
      {
        error: errorMessage,
        totalSteps: stepNumber,
        durationMs: Date.now() - runStartTime,
      },
      "Run failed with error",
    );
    await updateRunStatus(runId, "failed", agentResult);
    return agentResult;
  }
}