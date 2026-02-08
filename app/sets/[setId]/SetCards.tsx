/**
 * Set Cards Component
 *
 * Displays an individual card within a set detail page with uniform height for
 * virtualized grids. Shows card name, image, and collector number. Add to
 * collection and wishlist controls appear below. Cards with 0 owned copies
 * use reduced opacity and grayscale until added to the collection.
 *
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import AddToCollectionControl from "../../components/AddToCollectionControl";
import AddToWishlist from "../../components/AddToWishlist";

/** Fixed height per card (card + controls) for virtualized grid row height. */
export const SET_CARD_HEIGHT = 525;

export type SetCardsProps = {
    id?: string;
    name: string;
    game: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
    collectorNumber?: string;
    onOwnedCountChange?: (count: number) => void;
    onCardClick?: () => void;
    isWishlisted?: boolean;
    onWishlistToggle?: () => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onSelectionToggle?: (selected: boolean) => void;
};

export default function SetCards({
    name,
    game,
    imageSrc,
    description,
    ownedCount: initialOwnedCount,
    collectorNumber,
    onOwnedCountChange,
    onCardClick,
    isWishlisted: externalWishlisted = false,
    onWishlistToggle,
    isSelectionMode = false,
    isSelected = false,
    onSelectionToggle,
}: SetCardsProps) {
    const [qty, setQty] = useState(initialOwnedCount ?? 0);
    const [internalWishlisted, setInternalWishlisted] = useState(false);

    const wishlisted = onWishlistToggle ? externalWishlisted : internalWishlisted;

    useEffect(() => {
        setQty(initialOwnedCount ?? 0);
    }, [initialOwnedCount]);

    const handleQuantityChange = (newQty: number) => {
        setQty(newQty);
        onOwnedCountChange?.(newQty);
    };

    const totalOwned = qty;
    const isOwned = totalOwned > 0;

    return (
        <div
            className="flex flex-col gap-2 h-full min-h-0 overflow-hidden"
            style={{ height: SET_CARD_HEIGHT }}
        >
            {/* Card area: flex-1 with overflow-hidden so content stays inside */}
            <div
                onClick={onCardClick}
                onKeyDown={(e) => {
                    if (!onCardClick) return;
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onCardClick();
                    }
                }}
                role={onCardClick ? "button" : undefined}
                tabIndex={onCardClick ? 0 : undefined}
                className={`
          group relative rounded-lg border border-[var(--theme-border)]
          bg-[var(--theme-sidebar)] p-3 flex flex-col min-h-0 flex-1 overflow-hidden
          ${onCardClick ? "cursor-pointer" : ""}
          transition-all duration-200 ease-out
          ${isOwned ? "opacity-100" : "opacity-70 grayscale"}
          hover:opacity-100 hover:grayscale-0 hover:-translate-y-0.1
          hover:border-[var(--theme-accent-hover)] hover:shadow-[0_0_20px_var(--theme-accent)]/20
        `}
            >
                {/* Title + checkbox */}
                <div className="flex items-center justify-between gap-1 mb-2 flex-shrink-0 min-h-[2rem]">
                    <h3 className="text-sm font-semibold text-center flex-1 truncate" title={name}>
                        {name}
                    </h3>
                    {isSelectionMode && onSelectionToggle && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                onSelectionToggle(e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 cursor-pointer accent-[var(--theme-accent)] flex-shrink-0"
                            aria-label={`Select ${name}`}
                        />
                    )}
                </div>

                {/* Image: fills remaining space in card */}
                <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                    <div
                        className="w-full rounded overflow-hidden"
                        style={{ aspectRatio: "488 / 680" }}
                    >
                        {imageSrc && (
                            <img
                                src={imageSrc}
                                alt={name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                            />
                        )}
                    </div>
                </div>

                {/* Collector number only */}
                {collectorNumber && (
                    <p className="text-xs opacity-60 text-center flex-shrink-0 mt-1">
                        #{collectorNumber}
                    </p>
                )}
            </div>

            {/* Controls: fixed height */}
            <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="flex flex-col gap-1 flex-shrink-0"
            >
                <div className="flex justify-center items-center gap-2">
                    <AddToCollectionControl quantity={qty} onChange={handleQuantityChange} />
                </div>
                <div className="flex justify-center items-center">
                    <AddToWishlist
                        isWishlisted={wishlisted}
                        onToggle={() => {
                            if (onWishlistToggle) {
                                onWishlistToggle();
                            } else {
                                setInternalWishlisted((v) => !v);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
