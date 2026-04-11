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
import { Button } from "@/app/components/Button";

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
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => onChange(1)}
                    className="bg-black/5 dark:bg-white/5"
                >
                    Add to collection
                </Button>
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
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => canDecrease && onChange(quantity - 1)}
                        disabled={!canDecrease}
                        aria-label="Decrease quantity"
                        className="h-8 w-8 min-h-0 border-[var(--theme-border)] bg-[var(--theme-card)] p-1"
                    >
                        <MinusIcon className="h-4 w-4" />
                    </Button>

                    <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                        {quantity}
                    </span>

                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => canIncrease && onChange(quantity + 1)}
                        disabled={!canIncrease}
                        aria-label="Increase quantity"
                        className="h-8 w-8 min-h-0 border-[var(--theme-border)] bg-[var(--theme-card)] p-1"
                    >
                        <PlusIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
