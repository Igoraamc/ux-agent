import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import { createElementDetector } from "./detector.js";

export function createBrowser() {
  let browser: Browser | null = null;
  let page: Page | null = null;
  let allowedDomain: string | null = null;

  const detector = createElementDetector(() => page);

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

      const targetDomain = new URL(url).hostname;

      if (!allowedDomain) {
        allowedDomain = targetDomain;
      }

      if (targetDomain !== allowedDomain) {
        throw new Error(
          `Navigation blocked: ${targetDomain} is outside allowed domain`,
        );
      }

      await page.goto(url);
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
  };
}
