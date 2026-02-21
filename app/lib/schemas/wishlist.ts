/**
 * Zod schemas for wishlist-related API payloads.
 */

import { z } from "zod";

/** Schema for adding or removing a card from the wishlist */
export const wishlistToggleSchema = z
    .object({
        cardId: z.string().min(1, "cardId is required and must be a non-empty string"),
        isWishlisted: z.coerce.boolean({ required_error: "isWishlisted (boolean) is required" }),
    })
    .strict();

/** Inferred TypeScript type from the wishlist-toggle schema */
export type WishlistToggleInput = z.infer<typeof wishlistToggleSchema>;
