/**
 * Add to Wishlist Button Component
 * 
 * Toggle button for adding/removing cards from a user's wishlist.
 * Displays a heart icon that fills when the item is wishlisted.
 * 
 * @component
 * @example
 * <AddToWishlist 
 *   isWishlisted={false}
 *   onToggle={() => setWishlisted(!wishlisted)}
 * />
 */

"use client";

import { HeartIcon } from "lucide-react";
import { Button } from "@/app/components/Button";

type AddToWishlistProps = {
    /** Whether the item is currently in the wishlist */
    isWishlisted: boolean;
    /** Callback function called when the wishlist status is toggled */
    onToggle: () => void;
};

export default function AddToWishlist({
    isWishlisted,
    onToggle,
}: AddToWishlistProps) {
    return (
        <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            aria-pressed={isWishlisted}
            className="w-full bg-black/5 dark:bg-white/5 sm:w-auto"
        >
            <HeartIcon
                className={`h-4 w-4 shrink-0 transition-colors ${
                    isWishlisted
                        ? "fill-[var(--theme-accent)] text-[var(--theme-accent)]"
                        : "fill-transparent text-[var(--theme-fg)]"
                }`}
                aria-hidden
            />
            {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </Button>
    );
}
