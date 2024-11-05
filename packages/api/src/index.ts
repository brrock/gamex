// packages/api/src/index.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { generateRoutes } from "./generate-routes";

export async function createApp() {
  const app = new Hono();

  // Generate routes
  const routers = await generateRoutes();

  // Mount all routers with /api prefix
  Object.entries(routers).forEach(([path, router]) => {
    app.route(`/api/${path}`, router);
    console.log(`Mounted /api/${path}`);
  });

  return app;
}

export function createHandler() {
  let appPromise: Promise<Hono> | null = null;

  return async function handler(request: Request) {
    if (!appPromise) {
      appPromise = createApp();
    }
    const app = await appPromise;
    return handle(app)(request);
  };
}

export { createRouter } from "./router";
export type { Router } from "./router";

export default {
  createApp,
  createHandler,
};
