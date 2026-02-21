/**
 * Zod schemas for Scryfall-related API payloads.
 */

import { z } from "zod";

/** Schema for batch fetching cards by IDs */
export const batchCardsSchema = z
    .object({
        ids: z
            .array(z.string().min(1, "Each id must be a non-empty string"))
            .min(1, "ids array is required and must not be empty"),
    })
    .strict();

/** Inferred TypeScript type from the batch-cards schema */
export type BatchCardsInput = z.infer<typeof batchCardsSchema>;
