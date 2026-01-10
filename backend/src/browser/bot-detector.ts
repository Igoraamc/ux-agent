import type { Page } from "playwright";

export type BotProtectionType =
  | "cloudflare"
  | "recaptcha"
  | "hcaptcha"
  | "generic";

export interface BotProtectionResult {
  detected: boolean;
  type?: BotProtectionType;
  reason?: string;
}

export class BotProtectionError extends Error {
  constructor(public result: BotProtectionResult) {
    super(`Bot protection detected: ${result.type} - ${result.reason}`);
    this.name = "BotProtectionError";
  }
}

const CHALLENGE_TITLE_PATTERNS = [
  "just a moment",
  "checking your browser",
  "please wait",
  "attention required",
  "access denied",
  "you have been blocked",
  "one more step",
];

const CHALLENGE_URL_PATTERNS = [
  "/cdn-cgi/challenge",
  "/cdn-cgi/bm/cv",
  "challenges.cloudflare.com",
];

const CLOUDFLARE_SELECTORS = [
  "#challenge-form",
  "#challenge-running",
  ".challenge-wrapper",
  "#cf-challenge-running",
  "#cf-spinner-please-wait",
];

const RECAPTCHA_SELECTORS = [
  'iframe[src*="recaptcha"]',
  ".g-recaptcha",
  "#recaptcha",
];

const HCAPTCHA_SELECTORS = [".h-captcha", 'iframe[src*="hcaptcha"]'];

const GENERIC_CHALLENGE_SELECTORS = [
  '[data-testid="challenge"]',
  ".captcha",
  "#captcha",
];

export function createBotDetector(getPage: () => Page | null) {
  async function checkTitle(): Promise<BotProtectionResult | null> {
    const page = getPage();
    if (!page) return null;

    const title = await page.title();
    const lowerTitle = title.toLowerCase();

    for (const pattern of CHALLENGE_TITLE_PATTERNS) {
      if (lowerTitle.includes(pattern)) {
        return {
          detected: true,
          type: "cloudflare",
          reason: `Page title indicates challenge: "${title}"`,
        };
      }
    }
    return null;
  }

  async function checkUrl(): Promise<BotProtectionResult | null> {
    const page = getPage();
    if (!page) return null;

    const url = page.url();

    for (const pattern of CHALLENGE_URL_PATTERNS) {
      if (url.includes(pattern)) {
        return {
          detected: true,
          type: "cloudflare",
          reason: `URL contains challenge pattern: ${pattern}`,
        };
      }
    }
    return null;
  }

  async function checkCloudflareElements(): Promise<BotProtectionResult | null> {
    const page = getPage();
    if (!page) return null;

    for (const selector of CLOUDFLARE_SELECTORS) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return {
          detected: true,
          type: "cloudflare",
          reason: `Cloudflare challenge element found: ${selector}`,
        };
      }
    }
    return null;
  }

  async function checkRecaptcha(): Promise<BotProtectionResult | null> {
    const page = getPage();
    if (!page) return null;

    for (const selector of RECAPTCHA_SELECTORS) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return {
          detected: true,
          type: "recaptcha",
          reason: `reCAPTCHA element found: ${selector}`,
        };
      }
    }
    return null;
  }

  async function checkHcaptcha(): Promise<BotProtectionResult | null> {
    const page = getPage();
    if (!page) return null;

    for (const selector of HCAPTCHA_SELECTORS) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return {
          detected: true,
          type: "hcaptcha",
          reason: `hCaptcha element found: ${selector}`,
        };
      }
    }
    return null;
  }

  async function checkGenericChallenge(): Promise<BotProtectionResult | null> {
    const page = getPage();
    if (!page) return null;

    for (const selector of GENERIC_CHALLENGE_SELECTORS) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return {
          detected: true,
          type: "generic",
          reason: `Challenge element found: ${selector}`,
        };
      }
    }
    return null;
  }

  return {
    async detect(): Promise<BotProtectionResult> {
      const checks = [
        checkTitle,
        checkUrl,
        checkCloudflareElements,
        checkRecaptcha,
        checkHcaptcha,
        checkGenericChallenge,
      ];

      for (const check of checks) {
        try {
          const result = await check();
          if (result?.detected) {
            return result;
          }
        } catch {
          // Continue to next check if one fails
        }
      }

      return { detected: false };
    },
  };
}
