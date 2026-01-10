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
  const run = await db.query.runs.findFirst({
    where: eq(schema.runs.id, id),
    with: {
      steps: {
        orderBy: (steps, { asc }) => [asc(steps.stepNumber), asc(steps.createdAt)],
      },
    },
  });

  if (!run) {
    return c.json({ error: "Run not found" }, 404);
  }

  // Convert buffer screenshots to base64 for JSON response
  const runWithBase64Screenshots = {
    ...run,
    steps: run.steps.map((step) => ({
      ...step,
      screenshot: step.screenshot ? step.screenshot.toString("base64") : null,
    })),
  };

  return c.json(runWithBase64Screenshots);
});

export default runs;
