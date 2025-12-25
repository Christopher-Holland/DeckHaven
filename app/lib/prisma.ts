/**
 * Prisma Client Singleton
 * 
 * Provides a single instance of PrismaClient for database access.
 * Uses a global variable pattern to prevent multiple instances during
 * Next.js development hot-reload, which can cause connection pool issues.
 * 
 * @module lib/prisma
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Prisma Client instance
 * Reuses existing instance in development to prevent connection pool exhaustion
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

// Store in global scope in non-production environments to persist across hot-reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
