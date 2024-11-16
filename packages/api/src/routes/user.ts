import { createRouter } from "../router";
import { clerkMiddleware, getAuth } from 'clerk-auth-middleware';
import type { Context } from 'hono';
import { Env } from "hono";
const secretKey = process.env.CLERK_SECRET_KEY!;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
console.log(publishableKey);
const router = createRouter()
  .use("/", async (c: Context, next) => {
    const middleware = clerkMiddleware(secretKey, publishableKey);
    return middleware(c as any, next);
  })
  .get("/", (c) => {
    const auth = getAuth(c as any);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({
      userId: auth.userId,
    });
  });

export default router;