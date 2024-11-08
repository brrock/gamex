// apps/web/app/api/[...route]/route.ts
import { createHandler } from "api";

export const runtime = "edge";

const handler = createHandler();

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
