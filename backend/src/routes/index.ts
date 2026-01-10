import { Hono } from "hono";
import agent from "./agent.js";

const routes = new Hono();

routes.get("/", (c) => {
  return c.json({ status: "ok", service: "ux-agent" });
});

routes.route("/", agent);

export default routes;
