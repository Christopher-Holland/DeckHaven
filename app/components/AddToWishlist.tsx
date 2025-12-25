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
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation(); // Prevents card click navigation
                onToggle();
            }}
            className="
        w-auto
        text-sm font-medium
        px-3 py-1.5
        rounded-md
        border border-[#42c99c] dark:border-[#82664e]
        bg-black/5 dark:bg-white/5
        hover:bg-black/10 dark:hover:bg-white/10
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
        dark:focus:ring-[#82664e]
        flex items-center justify-center gap-2
      "
            aria-pressed={isWishlisted}
        >
            <HeartIcon
                className={`w-4 h-4 ${isWishlisted
                        ? "fill-[#42c99c] text-[#42c99c] dark:fill-red-300 dark:text-red-300"
                        : "fill-none"
                    }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            />
            {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </button>
    );
}
