import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    service: "ux-agent",
  },
});

export function createRunLogger(runId: string) {
  return logger.child({ runId });
}

export function createStepLogger(runId: string, step: number) {
  return logger.child({ runId, step });
}

export const httpLogger = logger.child({ component: "http" });
export const agentLogger = logger.child({ component: "agent" });
export const claudeLogger = logger.child({ component: "claude" });
