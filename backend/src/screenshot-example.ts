import { annotateScreenshot } from "./agent/annotator.js";
import { createBrowserService } from "./browser/browser-service.js";
import { createPlaywrightAdapter } from "./browser/playwright.js";

async function main() {
  const playwrightAdapter = createPlaywrightAdapter();
  const browser = createBrowserService(playwrightAdapter);

  try {
    await browser.initialize();
    console.log("Browser initialized");

    await browser.goto("https://github.com/login");
    console.log("Navigated to https://github.com/login");

    const interactiveElements = await browser.getInteractiveElements();
    console.log(interactiveElements);
    console.log("Interactive elements detected");

    const screenshot = await browser.screenshot("screenshot.png");
    if (!screenshot) {
      throw new Error("Failed to take screenshot");
    }
    console.log("Screenshot saved to screenshot.png");

    const annotatedScreenshot = await annotateScreenshot(
      screenshot,
      interactiveElements,
    );

    const fs = await import("fs/promises");
    await fs.writeFile("annotated-screenshot.png", annotatedScreenshot);
    console.log("Annotated screenshot saved to annotated-screenshot.png");

    await browser.close();
    console.log("Done");
  } catch (error) {
    console.error("Error:", error);
    await browser.close();
    process.exit(1);
  }
}

main();
