/**
 * Zod schemas for deck-related API payloads.
 * Single source of truth for deck input validation.
 */

import { z } from "zod";

const optionalString = z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v && typeof v === "string" && v.trim() ? v.trim() : null));

/** Schema for the add-card-to-deck request body */
export const addCardToDeckSchema = z
    .object({
        cardId: z.string().min(1, "cardId is required and must be a non-empty string"),
        quantity: z.coerce
            .number()
            .int("quantity must be an integer")
            .positive("quantity must be a positive number")
            .optional()
            .default(1),
    })
    .strict();

/** Inferred TypeScript type from the add-card-to-deck schema */
export type AddCardToDeckInput = z.infer<typeof addCardToDeckSchema>;

/** Schema for creating a new deck */
export const createDeckSchema = z
    .object({
        name: z.string().min(1, "name is required and must be a non-empty string").transform((s) => s.trim()),
        description: optionalString,
        format: optionalString,
        game: z.enum(["mtg", "pokemon", "yugioh"], {
            errorMap: () => ({ message: "game is required and must be one of: mtg, pokemon, yugioh" }),
        }),
        deckBoxColor: optionalString,
        trimColor: optionalString,
    })
    .strict();

/** Inferred TypeScript type from the create-deck schema */
export type CreateDeckInput = z.infer<typeof createDeckSchema>;

/** Schema for updating a deck */
export const updateDeckSchema = z
    .object({
        name: z.string().min(1, "name is required and must be a non-empty string").transform((s) => s.trim()),
        description: optionalString,
        format: optionalString,
        deckBoxColor: optionalString,
        trimColor: optionalString,
    })
    .strict();

/** Inferred TypeScript type from the update-deck schema */
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

/** Schema for updating a deck card's quantity */
export const updateDeckCardQuantitySchema = z
    .object({
        quantity: z.coerce
            .number()
            .int("quantity must be an integer")
            .min(0, "quantity must be a non-negative number"),
    })
    .strict();

/** Inferred TypeScript type from the update-deck-card-quantity schema */
export type UpdateDeckCardQuantityInput = z.infer<typeof updateDeckCardQuantitySchema>;
