import { db, schema } from "../db/index.js";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import type { AgentAction } from "../ai/actions.js";
import type { StepPhase } from "../types/index.js";
import type { NewRun } from "../db/schema.js";

async function compressScreenshot(screenshot: Buffer): Promise<Buffer> {
  return sharp(screenshot).webp({ quality: 80 }).toBuffer();
}

export async function createRun(run: NewRun): Promise<void> {
  await db.insert(schema.runs).values(run);
}

export async function persistStep(
  runId: string,
  stepNumber: number,
  phase: StepPhase,
  durationMs: number,
  data: {
    thinking?: string | null;
    action?: AgentAction;
    result?: string;
    screenshot?: Buffer;
  },
): Promise<void> {
  await db.insert(schema.steps).values({
    runId,
    stepNumber,
    phase,
    durationMs,
    thinking: data.thinking ?? null,
    action: data.action ? JSON.stringify(data.action) : null,
    result: data.result ?? null,
    screenshot: data.screenshot ? await compressScreenshot(data.screenshot) : null,
  });
}

export async function updateRunStatus(
  runId: string,
  status: "running" | "completed" | "failed",
  result?: { success?: boolean; summary?: string; error?: string },
): Promise<void> {
  await db
    .update(schema.runs)
    .set({
      status,
      success: result?.success,
      summary: result?.summary,
      error: result?.error,
      updatedAt: new Date(),
    })
    .where(eq(schema.runs.id, runId));
}
