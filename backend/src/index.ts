import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import routes from "./routes/index.js";
import "dotenv/config";

const app = new Hono();

app.use("/*", cors());
app.route("/", routes);

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Starting ux-agent server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
