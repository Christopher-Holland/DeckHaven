/**
 * Zod schemas for collection-related API payloads.
 */

import { z } from "zod";

const optionalString = z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v && typeof v === "string" && v.trim() ? v.trim() : null));

const optionalLanguage = z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v && typeof v === "string" && v.trim() ? v.trim().toLowerCase() : null));

/** Schema for adding or updating a card in the collection */
export const addToCollectionSchema = z
    .object({
        cardId: z.string().min(1, "cardId is required and must be a non-empty string"),
        quantity: z.coerce.number().int("quantity must be an integer").min(0, "quantity must be non-negative"),
        condition: optionalString,
        language: optionalLanguage,
        notes: optionalString,
        tags: optionalString,
        isFoil: z.coerce.boolean().optional().default(false),
    })
    .strict();

/** Inferred TypeScript type from the add-to-collection schema */
export type AddToCollectionInput = z.infer<typeof addToCollectionSchema>;
