import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Try multiple possible paths for the dist directory
  const possiblePaths = [
    path.resolve(process.cwd(), "dist"),
    path.resolve(process.cwd(), "../dist"),
    path.resolve(process.cwd(), "../../dist"),
    path.resolve(import.meta.dirname, "../dist"),
    path.resolve(import.meta.dirname, "../../dist"),
    "/app/dist",
  ];

  let distPath = possiblePaths.find((p) => fs.existsSync(path.join(p, "index.html")));

  if (!distPath) {
    console.error("Could not find dist directory. Tried:", possiblePaths);
    // Fallback to first option
    distPath = possiblePaths[0];
  }

  console.log("Serving static files from:", distPath);

  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath!, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
