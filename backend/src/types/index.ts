import type { AgentAction } from "../ai/actions.js";

export type DetectedElement = {
  index: number;
  selector: string;
  tagName: string;
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
};

export type StepPhase = "thinking" | "acting" | "result";

export type StepUpdate = {
  step: number;
  phase: StepPhase;
  action?: AgentAction;
  thinking?: string | null;
  result?: string;
  screenshot?: Buffer;
};

export type AgentResult = {
  success: boolean;
  steps: StepUpdate[];
  summary: string;
  error?: string;
};
