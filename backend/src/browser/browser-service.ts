import { validateUrl } from "../utils/validate.js";
import type { BrowserAdapter } from "./types.js";

export function createBrowserService(adapter: BrowserAdapter) {
  let allowedDomain: string | null;

  return {
    async initialize() {
      await adapter.initialize();
    },
    async goto(url: string) {
      const { valid, reason } = validateUrl(url);
      if (!valid) {
        throw new Error(reason ?? "Error while validating the URL");
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

      await adapter.goto(url);
    },
    async screenshot(path?: string) {
      return await adapter.screenshot(path);
    },
    async close() {
      await adapter.close();
    },
    async getInteractiveElements() {
      return await adapter.getInteractiveElements();
    },
  };
}
