import { createBrowserService } from "../browser/browser-service.js";
import type { AgentAction } from "../ai/actions.js";
import type { DetectedElement } from "../types/index.js";

export async function executeAction(
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
