import type { DetectedElement } from "../types/index.js";

export interface BrowserAdapter {
  initialize(): Promise<void>;
  goto(url: string): Promise<void>;
  screenshot(path?: string): Promise<Buffer>;
  close(): Promise<void>;
  getInteractiveElements(): Promise<DetectedElement[]>;
  click(selector: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  scroll(direction: "up" | "down"): Promise<void>;
  waitForLoadState(): Promise<void>;
}
