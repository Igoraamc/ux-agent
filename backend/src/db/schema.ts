import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  flowDescription: text("flow_description").notNull(),
  expectedResult: text("expected_result").notNull(),
  mode: text("mode", { enum: ["autonomous", "supervised", "manual"] }).notNull(),
  status: text("status", {
    enum: ["pending", "running", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  success: integer("success", { mode: "boolean" }),
  summary: text("summary"),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const steps = sqliteTable("steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: text("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  phase: text("phase", { enum: ["thinking", "acting", "result"] }).notNull(),
  thinking: text("thinking"),
  action: text("action"),
  result: text("result"),
  screenshot: blob("screenshot", { mode: "buffer" }),
  durationMs: integer("duration_ms").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Run = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;
export type Step = typeof steps.$inferSelect;
export type NewStep = typeof steps.$inferInsert;
