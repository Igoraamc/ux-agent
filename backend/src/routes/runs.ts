import { Hono } from "hono";
import { db, schema } from "../db/index.js";
import { desc, eq } from "drizzle-orm";

const runs = new Hono();

runs.get("/", async (c) => {
  const allRuns = await db.query.runs.findMany({
    orderBy: [desc(schema.runs.createdAt)],
    limit: 50,
  });
  return c.json(allRuns);
});

runs.get("/:id", async (c) => {
  const { id } = c.req.param();
  
  // Fetch run details without steps first
  const run = await db.query.runs.findFirst({
    where: eq(schema.runs.id, id),
  });

  if (!run) {
    return c.json({ error: "Run not found" }, 404);
  }

  // Fetch steps separately to avoid SQLite JSON/BLOB limitation in Drizzle relations
  const steps = await db.query.steps.findMany({
    where: eq(schema.steps.runId, id),
    orderBy: (steps, { asc }) => [asc(steps.stepNumber), asc(steps.createdAt)],
  });

  // Convert buffer screenshots to base64 for JSON response
  const runWithBase64Screenshots = {
    ...run,
    steps: steps.map((step) => ({
      ...step,
      screenshot: step.screenshot ? step.screenshot.toString("base64") : null,
    })),
  };

  return c.json(runWithBase64Screenshots);
});

runs.get("/:id/steps/:stepNumber", async (c) => {
  const { id, stepNumber } = c.req.param();
  const stepNum = parseInt(stepNumber, 10);

  if (isNaN(stepNum)) {
    return c.json({ error: "Invalid step number" }, 400);
  }

  const step = await db.query.steps.findFirst({
    where: (steps, { and, eq }) =>
      and(eq(steps.runId, id), eq(steps.stepNumber, stepNum)),
  });

  if (!step) {
    return c.json({ error: "Step not found" }, 404);
  }

  // Convert buffer screenshot to base64 for JSON response
  const stepWithBase64Screenshot = {
    ...step,
    screenshot: step.screenshot ? step.screenshot.toString("base64") : null,
  };

  return c.json(stepWithBase64Screenshot);
});

export default runs;
