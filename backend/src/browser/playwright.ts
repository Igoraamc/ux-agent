import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { createElementDetector } from "./detector.js";
import { createBotDetector } from "./bot-detector.js";
import type { BrowserAdapter } from "./types.js";

export function createPlaywrightAdapter(): BrowserAdapter {
  let browser: Browser | null = null;
  let page: Page | null = null;
  let allowedDomain: string | null = null;

  const detector = createElementDetector(() => page);
  const botDetector = createBotDetector(() => page);

  return {
    async initialize() {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      page = await browser.newPage();
    },

    async goto(url: string) {
      if (!page) {
        throw new Error("Browser not initialized. Call initialize() first.");
      }

      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {
        // Timeout is acceptable - some pages never reach network idle
      });
    },

    async screenshot(path?: string) {
      if (!page) {
        throw new Error("Browser not initialized. Call initialize() first.");
      }
      if (path) {
        return await page.screenshot({ path });
      } else {
        return await page.screenshot();
      }
    },

    async close() {
      if (browser) {
        await browser.close();
        browser = null;
        page = null;
      }
    },

    getInteractiveElements: detector.getInteractiveElements,

    async click(selector: string) {
      if (!page) {
        throw new Error("Browser not initialized. Call initialize() first.");
      }
      await page.click(selector);
      // Wait for potential navigation or dynamic content loading
      await page.waitForLoadState("networkidle").catch(() => {
        // Timeout is acceptable - not all clicks trigger navigation
      });
    },

    async type(selector: string, text: string) {
      if (!page) {
        throw new Error("Browser not initialized. Call initialize() first.");
      }
      await page.fill(selector, text);
    },

    async scroll(direction: "up" | "down" | "top") {
      if (!page) {
        throw new Error("Browser not initialized. Call initialize() first.");
      }
      if (direction === "top") {
        await page.evaluate(() => window.scrollTo(0, 0));
      } else {
        const scrollAmount = direction === "down" ? 500 : -500;
        await page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount);
      }
    },

    async waitForLoadState() {
      if (!page) {
        throw new Error("Browser not initialized. Call initialize() first.");
      }
      await page.waitForLoadState("networkidle");
    },

    detectBotProtection: botDetector.detect,
  };
}
