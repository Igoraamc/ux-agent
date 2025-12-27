import sharp from 'sharp';
import type { DetectedElement } from '../types/index.js';

export async function annotateScreenshot(screenshot: Buffer, elements: DetectedElement[]): Promise<Buffer> {
  const shot = sharp(screenshot);
  // 1. Create SVG overlay with rectangles and numbers
  // 2. Composite SVG onto screenshot using Sharp
  // 3. Return result
  return await shot.toBuffer();
}