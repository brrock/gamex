// packages/api/src/routes/test.ts
import { createRouter } from "../router";

const router = createRouter()
  .get("/", (c) =>
    c.json({
      message: "Hello from test route!",
      timestamp: new Date().toISOString(),
    }),
  )
  .get("/ping", (c) =>
    c.json({
      pong: true,
      timestamp: new Date().toISOString(),
    }),
  )
  .get("/info", (c) =>
    c.json({
      version: "1.0.0",
      environment: process.env.NODE_ENV,
    }),
  
  );
  
export default router;
