/**
 * Add to Collection Control Component
 * 
 * Provides a quantity control interface for adding cards to a user's collection.
 * Displays either an "Add to collection" button (when quantity is 0) or
 * increment/decrement controls (when quantity > 0).
 * 
 * @component
 * @example
 * <AddToCollectionControl 
 *   quantity={2} 
 *   onChange={(qty) => setQuantity(qty)}
 *   min={0}
 *   max={10}
 * />
 */

"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

type AddToCollectionControlProps = {
    /** Current quantity of cards owned */
    quantity: number;
    /** Callback function called when quantity changes */
    onChange: (nextQty: number) => void;
    /** Minimum allowed quantity (default: 0) */
    min?: number;
    /** Maximum allowed quantity (optional, no limit if undefined) */
    max?: number;
    /** Additional CSS classes */
    className?: string;
};

export default function AddToCollectionControl({
    quantity,
    onChange,
    min = 0,
    max,
    className = "",
}: AddToCollectionControlProps) {
    const canDecrease = quantity > min;
    const canIncrease = max == null ? true : quantity < max;

    return (
        <div
            className={className}
            onClick={(e) => e.stopPropagation()} // Prevents card click navigation
            onMouseDown={(e) => e.stopPropagation()}
        >
            {quantity <= 0 ? (
                // Show "Add to collection" button when quantity is 0
                <button
                    type="button"
                    onClick={() => onChange(1)}
                    className="
            w-full
            text-sm font-medium
            px-3 py-1.5
            rounded-md
            border border-[var(--theme-border)]
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
          "
                >
                    Add to collection
                </button>
            ) : (
                // Show increment/decrement controls when quantity > 0
                <div
                    className="
            inline-flex items-center gap-2
            px-2 py-1.5
            rounded-md
            bg-black/5 dark:bg-white/5
            border border-[var(--theme-border)]
          "
                    aria-label="Adjust quantity"
                >
                    <button
                        type="button"
                        onClick={() => canDecrease && onChange(quantity - 1)}
                        disabled={!canDecrease}
                        className="
              p-1 rounded
              border border-[var(--theme-border)]
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
                        onClick={() => canIncrease && onChange(quantity + 1)}
                        disabled={!canIncrease}
                        className="
              p-1 rounded
              border border-[var(--theme-border)]
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
