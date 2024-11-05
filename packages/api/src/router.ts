// packages/api/src/router.ts
import { Hono } from "hono";

export type Router = Hono;

export function createRouter(): Router {
  return new Hono();
}
