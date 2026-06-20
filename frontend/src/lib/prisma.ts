import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // At build time, DATABASE_URL may not be present in the build environment.
    // Return a bare PrismaClient — it won't be called at runtime without the URL.
    // Runtime API calls will still work because Vercel injects env vars at runtime.
    return new PrismaClient();
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  global.__prisma ?? (global.__prisma = createPrismaClient());
