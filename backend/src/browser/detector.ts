import type { Page } from "playwright";
import type { DetectedElement } from "../types/index.js";
import {
  INTERACTIVE_SELECTORS,
  getUniqueSelector,
  getElementAttributes,
} from "./selectors.js";

const MIN_BOUNDING_BOX_SIZE = 5;

export function createElementDetector(getPage: () => Page | null) {
  return {
    async getInteractiveElements(): Promise<DetectedElement[]> {
      const page = getPage();
      if (!page) {
        throw new Error("Browser not initialized");
      }

      const elements: DetectedElement[] = [];
      const interactiveElements = await page.$$(
        INTERACTIVE_SELECTORS.join(","),
      );
      let index = 0;

      for (const element of interactiveElements) {
        const boundingBox = await element.boundingBox();
        if (!boundingBox) {
          continue;
        }

        if (
          boundingBox.width < MIN_BOUNDING_BOX_SIZE &&
          boundingBox.height < MIN_BOUNDING_BOX_SIZE
        ) {
          continue;
        }

        const text = (await element.textContent()) ?? "";
        const selector = await element.evaluate(getUniqueSelector);
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase(),
        );
        const attributes = await element.evaluate(getElementAttributes);
        elements.push({
          index: index++,
          selector,
          tagName,
          text,
          boundingBox,
          attributes,
        });
      }

      return elements;
    },
  };
}
