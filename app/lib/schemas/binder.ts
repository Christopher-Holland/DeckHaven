/**
 * Zod schemas for binder-related API payloads.
 */

import { z } from "zod";

const optionalString = z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v && typeof v === "string" && v.trim() ? v.trim() : null));

const gameEnum = z
    .enum(["mtg", "pokemon", "yugioh"])
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const sizeEnum = z
    .enum(["2x2", "3x3", "4x4"])
    .nullable()
    .optional()
    .transform((v) => v ?? null);

/** Schema for creating a new binder */
export const createBinderSchema = z
    .object({
        name: z.string().min(1, "name is required and must be a non-empty string").transform((s) => s.trim()),
        description: optionalString,
        color: optionalString,
        spineColor: optionalString,
        pageColor: optionalString,
        game: gameEnum,
        size: sizeEnum,
    })
    .strict();

/** Inferred TypeScript type from the create-binder schema */
export type CreateBinderInput = z.infer<typeof createBinderSchema>;

/** Schema for updating a binder */
export const updateBinderSchema = z
    .object({
        name: z.string().min(1, "name is required and must be a non-empty string").transform((s) => s.trim()),
        description: optionalString,
        color: optionalString,
        spineColor: optionalString,
        pageColor: optionalString,
        game: gameEnum,
        size: sizeEnum,
    })
    .strict();

/** Inferred TypeScript type from the update-binder schema */
export type UpdateBinderInput = z.infer<typeof updateBinderSchema>;

/** Schema for adding a card to a binder */
export const addCardToBinderSchema = z
    .object({
        cardId: z.string().min(1, "cardId is required and must be a non-empty string"),
        slotNumber: z
            .union([
                z.coerce.number().int("slotNumber must be an integer").min(0, "slotNumber must be non-negative"),
                z.null(),
            ])
            .optional(),
    })
    .strict();

/** Inferred TypeScript type from the add-card-to-binder schema */
export type AddCardToBinderInput = z.infer<typeof addCardToBinderSchema>;

/** Schema for moving a card to a new slot in a binder */
export const moveBinderCardSchema = z
    .object({
        newSlotNumber: z.coerce
            .number()
            .int("newSlotNumber must be an integer")
            .min(0, "newSlotNumber must be non-negative"),
    })
    .strict();

/** Inferred TypeScript type from the move-binder-card schema */
export type MoveBinderCardInput = z.infer<typeof moveBinderCardSchema>;
