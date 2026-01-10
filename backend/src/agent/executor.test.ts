import { describe, expect, test, mock } from "bun:test";
import { executeAction } from "./executor.js";
import type { AgentAction } from "../ai/actions.js";
import type { DetectedElement } from "../types/index.js";

function createMockBrowser() {
  return {
    click: mock(() => Promise.resolve()),
    type: mock(() => Promise.resolve()),
    scroll: mock(() => Promise.resolve()),
    waitForLoadState: mock(() => Promise.resolve()),
    initialize: mock(() => Promise.resolve()),
    goto: mock(() => Promise.resolve()),
    screenshot: mock(() => Promise.resolve(Buffer.from(""))),
    close: mock(() => Promise.resolve()),
    getInteractiveElements: mock(() => Promise.resolve([])),
  };
}

const mockElements: DetectedElement[] = [
  {
    index: 0,
    selector: "button.submit",
    tagName: "button",
    text: "Submit",
    boundingBox: { x: 0, y: 0, width: 100, height: 40 },
    attributes: {},
  },
  {
    index: 1,
    selector: "input[name='email']",
    tagName: "input",
    text: "",
    boundingBox: { x: 0, y: 50, width: 200, height: 30 },
    attributes: { name: "email" },
  },
];

describe("executeAction", () => {
  describe("click action", () => {
    test("clicks element and waits for load state", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "click",
        args: { element_index: 0, reason: "Submit form" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(browser.click).toHaveBeenCalledWith("button.submit");
      expect(browser.waitForLoadState).toHaveBeenCalled();
      expect(result).toBe('Clicked element 0: "Submit"');
    });

    test("uses tagName when text is empty", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "click",
        args: { element_index: 1, reason: "Click input" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(result).toBe('Clicked element 1: "input"');
    });

    test("throws when element not found", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "click",
        args: { element_index: 999, reason: "Click missing" },
      };

      await expect(
        executeAction(browser as any, action, mockElements),
      ).rejects.toThrow("Element with index 999 not found");
    });
  });

  describe("type action", () => {
    test("types text into element", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "type",
        args: { element_index: 1, text: "test@example.com", reason: "Enter email" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(browser.type).toHaveBeenCalledWith(
        "input[name='email']",
        "test@example.com",
      );
      expect(result).toBe('Typed "test@example.com" into element 1');
    });

    test("throws when element not found", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "type",
        args: { element_index: 999, text: "test", reason: "Type in missing" },
      };

      await expect(
        executeAction(browser as any, action, mockElements),
      ).rejects.toThrow("Element with index 999 not found");
    });
  });

  describe("scroll action", () => {
    test("scrolls down", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "scroll",
        args: { direction: "down", reason: "See more content" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(browser.scroll).toHaveBeenCalledWith("down");
      expect(result).toBe("Scrolled down");
    });

    test("scrolls up", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "scroll",
        args: { direction: "up", reason: "Go back" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(browser.scroll).toHaveBeenCalledWith("up");
      expect(result).toBe("Scrolled up");
    });

    test("scrolls to top", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "scroll",
        args: { direction: "top", reason: "Go to top" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(browser.scroll).toHaveBeenCalledWith("top");
      expect(result).toBe("Scrolled to top of page");
    });
  });

  describe("wait action", () => {
    test("waits for specified seconds", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "wait",
        args: { seconds: 1, reason: "Wait for load" },
      };

      const start = Date.now();
      const result = await executeAction(browser as any, action, mockElements);
      const elapsed = Date.now() - start;

      // Allow 50ms tolerance for timer precision
      expect(elapsed).toBeGreaterThanOrEqual(950);
      expect(elapsed).toBeLessThan(1500);
      expect(result).toBe("Waited 1 seconds");
    });

    test("clamps seconds to minimum of 1", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "wait",
        args: { seconds: 0, reason: "Wait" },
      };

      const start = Date.now();
      const result = await executeAction(browser as any, action, mockElements);
      const elapsed = Date.now() - start;

      // Allow 50ms tolerance for timer precision
      expect(elapsed).toBeGreaterThanOrEqual(950);
      expect(result).toBe("Waited 1 seconds");
    });

    test("clamps seconds to maximum of 5", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "wait",
        args: { seconds: 100, reason: "Wait long" },
      };

      const start = Date.now();
      const result = await executeAction(browser as any, action, mockElements);
      const elapsed = Date.now() - start;

      // Allow 50ms tolerance for timer precision
      expect(elapsed).toBeGreaterThanOrEqual(4950);
      expect(elapsed).toBeLessThan(5500);
      expect(result).toBe("Waited 5 seconds");
    });
  });

  describe("done action", () => {
    test("returns completion message", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "done",
        args: { summary: "Test passed", expected_result_achieved: true },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(result).toBe("Test marked as complete");
    });
  });

  describe("fail action", () => {
    test("returns failure message with reason", async () => {
      const browser = createMockBrowser();
      const action: AgentAction = {
        action: "fail",
        args: { reason: "Blocked by captcha", blocker: "captcha" },
      };

      const result = await executeAction(browser as any, action, mockElements);

      expect(result).toBe("Test marked as failed: Blocked by captcha");
    });
  });
});
