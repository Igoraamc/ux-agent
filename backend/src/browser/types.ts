import type { DetectedElement } from "../types/index.js";

export interface BrowserAdapter {
  initialize(): Promise<void>;
  goto(url: string): Promise<void>;
  screenshot(path?: string): Promise<Buffer>;
  close(): Promise<void>;
  getInteractiveElements(): Promise<DetectedElement[]>;
}
