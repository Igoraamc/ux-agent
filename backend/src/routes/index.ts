import { Hono } from "hono";
import agent from "./agent.js";
import runs from "./runs.js";

const routes = new Hono();

routes.get("/", (c) => {
  return c.json({ status: "ok", service: "ux-agent" });
});

routes.route("/", agent);
routes.route("/runs", runs);

export default routes;
