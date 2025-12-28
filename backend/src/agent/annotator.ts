import sharp from "sharp";
import type { DetectedElement } from "../types/index.js";

export async function annotateScreenshot(
  screenshot: Buffer,
  elements: DetectedElement[],
): Promise<Buffer> {
  const screenshotSharp = sharp(screenshot);
  const { width, height } = await screenshotSharp.metadata();

  let svgOverlay = `<svg width="${width}" height="${height}">`;

  for (const element of elements) {
    const { x, y, width: w, height: h } = element.boundingBox;

    svgOverlay += `
      <rect
        x="${x}"
        y="${y}"
        width="${w}"
        height="${h}"
        fill="none"
        stroke="red"
        stroke-width="2"
      />`;

    svgOverlay += `
      <circle cx="${x + 10}" cy="${y + 10}" r="10" fill="red"/>
      <text
        x="${x + 10}" y="${y + 14}"
        text-anchor="middle"
        fill="white"
        font-size="12"
        font-family="Arial"
      >${element.index}</text>`;
  }

  svgOverlay += `
    </svg>
  `;

  screenshotSharp.composite([
    {
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0,
    },
  ]);

  return await screenshotSharp.toBuffer();
}
