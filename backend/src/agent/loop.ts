import { createPlaywrightAdapter } from "../browser/playwright.js";
import { createBrowserService } from "../browser/browser-service.js";
import { createClaudeAgent, type AgentResponse } from "../ai/claude.js";
import { annotateScreenshot } from "./annotator.js";
import type { DetectedElement } from "../types/index.js";
import type { AgentAction } from "../ai/actions.js";

const MAX_STEPS = 15;

export type StepPhase = "thinking" | "acting" | "result";

export type StepUpdate = {
  step: number;
  phase: StepPhase;
  action?: AgentAction;
  thinking?: string | null;
  result?: string;
  screenshot?: Buffer;
};

export type AgentResult = {
  success: boolean;
  steps: StepUpdate[];
  summary: string;
  error?: string;
};

type OnStepUpdate = (update: StepUpdate) => void;

export async function runAgentLoop(
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

  const emitUpdate = (update: StepUpdate) => {
    steps.push(update);
    onStepUpdate?.(update);
  };

  try {
    await browser.initialize();
    await browser.goto(url);

    while (stepNumber < MAX_STEPS) {
      stepNumber++;

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

      emitUpdate({
        step: stepNumber,
        phase: "thinking",
        thinking: response.thinking,
        screenshot: annotated,
      });

      emitUpdate({
        step: stepNumber,
        phase: "acting",
        action: response.action,
      });

      const result = await executeAction(browser, response.action, elements);

      actionHistory.push(result);

      emitUpdate({
        step: stepNumber,
        phase: "result",
        result,
      });

      if (response.action.action === "done") {
        const args = response.action.args as {
          summary: string;
          expected_result_achieved: boolean;
        };
        await browser.close();
        return {
          success: args.expected_result_achieved,
          steps,
          summary: args.summary,
        };
      }

      if (response.action.action === "fail") {
        const args = response.action.args as {
          reason: string;
          blocker: string;
        };
        await browser.close();
        return {
          success: false,
          steps,
          summary: `Test failed: ${args.reason}. Blocker: ${args.blocker}`,
        };
      }
    }

    await browser.close();
    return {
      success: false,
      steps,
      summary: `Test stopped after reaching ${MAX_STEPS} step limit`,
    };
  } catch (error) {
    await browser.close().catch(() => {});
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      steps,
      summary: "Test failed due to error",
      error: errorMessage,
    };
  }
}

async function executeAction(
  browser: ReturnType<typeof createBrowserService>,
  action: AgentAction,
  elements: DetectedElement[],
): Promise<string> {
  switch (action.action) {
    case "click": {
      const element = elements.find(
        (e) => e.index === action.args.element_index,
      );
      if (!element) {
        throw new Error(
          `Element with index ${action.args.element_index} not found`,
        );
      }
      await browser.click(element.selector);
      await browser.waitForLoadState();
      return `Clicked element ${action.args.element_index}: "${element.text || element.tagName}"`;
    }

    case "type": {
      const element = elements.find(
        (e) => e.index === action.args.element_index,
      );
      if (!element) {
        throw new Error(
          `Element with index ${action.args.element_index} not found`,
        );
      }
      await browser.type(element.selector, action.args.text);
      return `Typed "${action.args.text}" into element ${action.args.element_index}`;
    }

    case "scroll": {
      await browser.scroll(action.args.direction);
      return `Scrolled ${action.args.direction}`;
    }

    case "wait": {
      const seconds = Math.min(Math.max(action.args.seconds, 1), 5);
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      return `Waited ${seconds} seconds`;
    }

    case "done":
      return "Test marked as complete";

    case "fail":
      return `Test marked as failed: ${action.args.reason}`;

    default:
      throw new Error(`Unknown action: ${(action as AgentAction).action}`);
  }
}
