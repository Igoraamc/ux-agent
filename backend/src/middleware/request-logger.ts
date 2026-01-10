import type { MiddlewareHandler } from "hono";
import { httpLogger } from "../lib/logger.js";

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();

  httpLogger.info(
    {
      method: c.req.method,
      path: c.req.path,
    },
    "Request received",
  );

  await next();

  httpLogger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - startTime,
    },
    "Request completed",
  );
};
