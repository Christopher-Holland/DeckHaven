"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

type Props = {
    quantity: number;                 // current owned qty
    onChange: (nextQty: number) => void;
    min?: number;                      // default 0
    max?: number;                      // optional cap
    className?: string;
};

export default function AddToCollectionControl({
    quantity,
    onChange,
    min = 0,
    max,
    className = "",
}: Props) {
    const canDec = quantity > min;
    const canInc = max == null ? true : quantity < max;

    return (
        <div
            className={className}
            onClick={(e) => e.stopPropagation()} // prevents card click navigation
            onMouseDown={(e) => e.stopPropagation()}
        >
            {quantity <= 0 ? (
                <button
                    type="button"
                    onClick={() => onChange(1)}
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
          "
                >
                    Add to collection
                </button>
            ) : (
                <div
                    className="
            inline-flex items-center gap-2
            px-2 py-1.5
            rounded-md
            bg-black/5 dark:bg-white/5
            border border-[#42c99c] dark:border-[#82664e]
          "
                    aria-label="Adjust quantity"
                >
                    <button
                        type="button"
                        onClick={() => canDec && onChange(quantity - 1)}
                        disabled={!canDec}
                        className="
              p-1 rounded
              border border-[#42c99c] dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
            "
                        aria-label="Decrease quantity"
                    >
                        <MinusIcon className="w-4 h-4" />
                    </button>

                    <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={() => canInc && onChange(quantity + 1)}
                        disabled={!canInc}
                        className="
              p-1 rounded
              border border-[#42c99c] dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-white/10
              disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
            "
                        aria-label="Increase quantity"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            
        </div>
    );
}

