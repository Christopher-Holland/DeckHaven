"use client";

import { HeartIcon } from "lucide-react";

type Props = {
    isWishlisted: boolean;
    onToggle: () => void;
};

export default function AddToWishlistButton({
    isWishlisted,
    onToggle,
}: Props) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className="
        w-full
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
                        ? "fill-[#42c99c] text-[#42c99c] dark:fill-yellow-300 dark:text-yellow-300"
                        : "fill-none"
                    }`}
            />
            {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </button>
    );
}

