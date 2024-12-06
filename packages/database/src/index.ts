export * from "@prisma/client";
export { PrismaClient as PrismaClientEdge } from "@prisma/client/edge";
export type { Prisma } from "@prisma/client";
export type { Game } from "@prisma/client";
export type { PlayerData } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Edge environment compatibility: Use Vercel's Edge Runtime for env variables
const connectionString = process.env.DATABASE_URL as string;

// Configure Neon with Edge-compatible options (no WebSocket constructor needed)
neonConfig.fetchConnectionCache = true; // Enable fetch-based connection caching for Edge

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const PrismaDriverEdge = new PrismaClient({ adapter });

export default PrismaDriverEdge;
