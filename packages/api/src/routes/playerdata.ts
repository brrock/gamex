// packages/api/src/routes/playerdata.ts
import { createRouter } from "../router";
import prisma from "../db";
import { Redis } from "@upstash/redis";
import { createHmac } from "crypto";
import { z } from "zod";
import type { Prisma, Game, PlayerData } from "database";

// Validation schemas
const PlayerDataSchema = z.object({
  userId: z.string(),
  data: z.unknown(),
  game: z.string(),
  signature: z.string(),
  timestamp: z.string(),
});

// Types
interface QueueItem {
  userId: string;
  data: Prisma.JsonValue;
  game: string;
  signature: string;
  timestamp: string;
  queueTimestamp: number;
  tempId: string;
}

// Constants
const QUEUE_KEY = "playerdata:queue";
const BATCH_SIZE = 100;
const PROCESS_INTERVAL = 5000; // 5 seconds

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Type guard for QueueItem
function isQueueItem(item: unknown): item is QueueItem {
  const queueItem = item as QueueItem;
  return (
    typeof queueItem?.userId === "string" &&
    typeof queueItem?.game === "string" &&
    typeof queueItem?.signature === "string" &&
    typeof queueItem?.timestamp === "string" &&
    typeof queueItem?.queueTimestamp === "number" &&
    typeof queueItem?.tempId === "string" &&
    queueItem?.data !== undefined
  );
}

// Security validation helper
function validateSignature(
  payload: string,
  timestamp: string,
  signature: string,
  gameSecret: string,
): boolean {
  const data = `${payload}:${timestamp}`;
  const expectedSignature = createHmac("sha256", gameSecret)
    .update(data)
    .digest("hex");
  return expectedSignature === signature;
}

// Game auth middleware
async function validateGameAuth(c: any, next: () => Promise<void>) {
  const gameId = c.req.header("X-Game-ID");
  const timestamp = c.req.header("X-Timestamp");
  const signature = c.req.header("X-Signature");

  if (!gameId || !timestamp || !signature) {
    return c.json(
      { success: false, error: "Missing authentication headers" },
      401,
    );
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, secret: true },
  });

  if (!game) {
    return c.json({ success: false, error: "Game not found" }, 404);
  }

  const payload = await c.req.raw.clone().text();
  if (!validateSignature(payload, timestamp, signature, game.secret)) {
    return c.json({ success: false, error: "Invalid signature" }, 401);
  }

  await next();
}

// Redis operations with type safety
class PlayerDataQueue {
  static async pushItem(item: QueueItem): Promise<void> {
    await redis.lpush(QUEUE_KEY, JSON.stringify(item));
  }

  static async popItem(): Promise<QueueItem | null> {
    const item = await redis.rpop<string>(QUEUE_KEY);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);
      if (isQueueItem(parsed)) {
        return parsed;
      }
      console.error("Invalid queue item format:", parsed);
      return null;
    } catch (error) {
      console.error("Error parsing queue item:", error);
      return null;
    }
  }

  static async processBatch(batchSize: number): Promise<QueueItem[]> {
    // Using pipeline for better performance
    const pipeline = redis.pipeline();
    for (let i = 0; i < batchSize; i++) {
      pipeline.rpop<string>(QUEUE_KEY);
    }

    const results = await pipeline.exec<string[]>();
    const items: QueueItem[] = [];

    for (const result of results) {
      if (!result) continue;

      try {
        const parsed = JSON.parse(result);
        if (isQueueItem(parsed)) {
          items.push(parsed);
        }
      } catch (error) {
        console.error("Error parsing queue item:", error);
      }
    }

    return items;
  }

  static async returnItemsToQueue(items: QueueItem[]): Promise<void> {
    const pipeline = redis.pipeline();
    items.forEach((item) => {
      pipeline.lpush(QUEUE_KEY, JSON.stringify(item));
    });
    await pipeline.exec();
  }
}

// Queue processor function
async function processQueue(): Promise<void> {
  try {
    const items = await PlayerDataQueue.processBatch(BATCH_SIZE);

    if (items.length === 0) return;

    items.sort((a, b) => a.queueTimestamp - b.queueTimestamp);

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const { userId, data, game } = item;

        await tx.playerData.upsert({
          where: {
            userId_game: {
              userId,
              game,
            },
          },
          update: {
            data: data!,
          },
          create: {
            id: crypto.randomUUID(),
            userId,
            game,
            data: data!,
          },
        });
      }
    });

    console.log(`Processed ${items.length} player data items`);
  } catch (error) {
    console.error("Queue processing error:", error);
    const items = await PlayerDataQueue.processBatch(BATCH_SIZE);
    if (items.length > 0) {
      await PlayerDataQueue.returnItemsToQueue(items);
    }
  }
}

// Create and configure router
const router = createRouter()
  // Submit player data
  .post("/submit", validateGameAuth, async (c) => {
    try {
      const body = await c.req.json();
      const validatedData = PlayerDataSchema.parse(body);

      const queueItem: QueueItem = {
        ...validatedData,
        queueTimestamp: Date.now(),
        tempId: crypto.randomUUID(),
        data: z.array(z.string()).parse(validatedData.data), // Parse data as a JSON value
      };

      await PlayerDataQueue.pushItem(queueItem);

      return c.json(
        {
          success: true,
          message: "Player data queued for processing",
          tempId: queueItem.tempId,
        },
        202,
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ success: false, errors: error.errors }, 400);
      }
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  })

  // Get current user's data
  .get("/me", validateGameAuth, async (c) => {
    try {
      const userId = c.req.header("X-User-ID");
      const gameId = c.req.header("X-Game-ID");

      if (!userId) {
        return c.json({ success: false, error: "User ID required" }, 400);
      }

      const playerData = await prisma.playerData.findUnique({
        where: {
          userId_game: {
            userId,
            game: gameId!,
          },
        },
      });

      return c.json({
        success: true,
        data: playerData,
      });
    } catch (error) {
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  })

  // Get all player data for a game
  .get("/game/:gameId", validateGameAuth, async (c) => {
    try {
      const gameId = c.req.param("gameId");

      const playerData = await prisma.playerData.findMany({
        where: {
          game: gameId,
        },
      });

      return c.json({
        success: true,
        data: playerData,
      });
    } catch (error) {
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  });

export default router;
