/**
 * Zod schemas for deck-related API payloads.
 * Single source of truth for "Add Card to Deck" input validation.
 */

import { z } from "zod";

/** Schema for the add-card-to-deck request body */
export const addCardToDeckSchema = z.object({
    cardId: z.string().min(1, "cardId is required and must be a non-empty string"),
    quantity: z.coerce
        .number()
        .int("quantity must be an integer")
        .positive("quantity must be a positive number")
        .optional()
        .default(1),
}).strict();

/** Inferred TypeScript type from the add-card-to-deck schema */
export type AddCardToDeckInput = z.infer<typeof addCardToDeckSchema>;
