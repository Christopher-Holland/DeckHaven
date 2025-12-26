/**
 * Set Cards Component
 * 
 * Displays an individual card within a set detail page. Shows card name, image, description,
 * collector number, and owned count. Cards with 0 owned copies are displayed with reduced
 * opacity and grayscale filter until added to the collection.
 * 
 * Includes "Add to Collection" and "Add to Wishlist" controls below each card. The component
 * manages local state for quantity and wishlist status, and can notify parent components
 * when the owned count changes.
 * 
 * Used in the set detail page (/sets/[setId]) to render each card in the set.
 * 
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import AddToCollectionControl from "../../components/AddToCollectionControl";
import AddToWishlist from "../../components/AddToWishlist";
import { HeartIcon } from "lucide-react";

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
}: SetCardsProps) {
    const [qty, setQty] = useState(initialOwnedCount ?? 0);
    const [internalWishlisted, setInternalWishlisted] = useState(false);

    // Use external wishlist state if provided, otherwise use internal state
    const wishlisted = onWishlistToggle ? externalWishlisted : internalWishlisted;

    // Update local state when prop changes
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
        <div className="flex flex-col gap-3">
            {/* CARD */}
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
          group relative rounded-lg
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#e8d5b8] dark:bg-[#173c3f]
          p-4
          ${onCardClick ? "cursor-pointer" : ""}
          transition-all duration-200 ease-out
          ${isOwned 
            ? "opacity-100" 
            : "opacity-50 grayscale"
          }
          hover:opacity-100 hover:grayscale-0
          hover:-translate-y-0.5
          hover:border-[#2fbf8f]
          dark:hover:border-[#9b7a5f]
          hover:shadow-[0_0_20px_rgba(130,102,78,0.2)]
          dark:hover:shadow-[0_0_30px_rgba(66,201,156,0.35)]
        `}
            >
                {/* Card Name - At the top */}
                <h3 className="text-md font-semibold mb-3 text-center">{name}</h3>

                {/* Card Image */}
                {imageSrc && (
                    <img 
                        src={imageSrc} 
                        alt={name} 
                        className="w-full h-auto mb-3 rounded" 
                    />
                )}

                {/* Description */}
                {description && (
                    <p className="text-xs opacity-80 text-center mb-2 line-clamp-3">
                        {description}
                    </p>
                )}

                {/* Collector Number */}
                {collectorNumber && (
                    <p className="text-xs opacity-60 text-center mb-2">
                        #{collectorNumber}
                    </p>
                )}

                {/* Owned Count */}
                <p className="text-xs opacity-70 text-center">
                    Owned: {totalOwned}
                </p>
            </div>

            {/* CONTROLS UNDER THE CARD */}
            <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center items-center gap-4 mb-2">
                    <AddToCollectionControl quantity={qty} onChange={handleQuantityChange} />
                </div>

                <div className="flex justify-center items-center gap-4 mb-2">
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

