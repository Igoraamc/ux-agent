import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import routes from "./routes/index.js";
import { requestLogger } from "./middleware/request-logger.js";
import { logger } from "./lib/logger.js";
import "dotenv/config";

const app = new Hono();

app.use("/*", requestLogger);
app.use("/*", cors());
app.route("/", routes);

const port = parseInt(process.env.PORT || "3000", 10);

serve({
  fetch: app.fetch,
  port,
});

logger.info({ port }, "Server started");
