"use client";

import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddToCollectionControl from "../../components/AddToCollectionControl";
import AddToWishlist from "../../components/AddToWishlist";

export type CardsCardProps = {
    id?: string;
    href?: string;
    name: string;
    game: string;
    imageSrc: string;
    description: string;
    ownedCount: number;

    isFavorited?: boolean;
    isWishlisted?: boolean;
    inCollection?: boolean;
    onToggleFavorite?: () => void;
    onToggleWishlist?: () => void;
    onToggleCollection?: () => void;
    isInCollection?: boolean;
};

export default function CardsCard({
    id,
    href,
    name,
    game,
    imageSrc,
    description,
    ownedCount,
    isFavorited = false,
    isWishlisted = false,
    inCollection = false,
    isInCollection = false,
    onToggleFavorite,
    onToggleWishlist,
    onToggleCollection
}: CardsCardProps) {
    const router = useRouter();
    const handleNavigate = () => {
        if (href) {
            router.push(href);
        }
    };
    const [qty, setQty] = useState(ownedCount ?? 0);
    const [wishlisted, setWishlisted] = useState(false);
    return (
        <div
            onClick={handleNavigate}
            onKeyDown={(e) => {
                if (!href) return;
                if (e.key === "Enter" || e.key === " ") {
                    router.push(href);
                }
            }}
            role={href ? "button" : undefined}
            tabIndex={href ? 0 : undefined}
            className="
                group relative rounded-lg
                border border-[#42c99c] dark:border-[#82664e]
                bg-[#e8d5b8] dark:bg-[#173c3f]
                p-4
                cursor-pointer
                transition-all duration-200 ease-out
                hover:-translate-y-0.5
                hover:border-[#2fbf8f]
                dark:hover:border-[#9b7a5f]
                hover:shadow-[0_0_20px_rgba(130,102,78,0.2)]
                dark:hover:shadow-[0_0_30px_rgba(66,201,156,0.35)]
            "
        >
            {/* Favorite Button */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite?.();
                }}
                className="
                    absolute top-2 right-2 z-10
                    p-1 rounded
                    hover:opacity-80
                    focus:outline-none
                    focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                    transition-opacity
                "
                aria-label={isFavorited ? "Unfavorite card" : "Favorite card"}
            >
                <StarIcon
                    className={`
                        w-4 h-4
                        ${isFavorited
                            ? "fill-[#42c99c] text-[#42c99c] dark:fill-yellow-300 dark:text-yellow-300"
                            : "fill-none text-current"
                        }
                    `}
                />
            </button>

            {/* Card Image */}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={name}
                    className="w-full h-auto mb-3 rounded"
                />
            )}

            {/* Card Name */}
            <h3 className="text-md font-semibold mb-2 text-center">
                {name}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-xs opacity-80 text-center mb-2">
                    {description}
                </p>
            )}

            {/* Owned Count */}
            <p className="text-xs opacity-70 text-center">
                Owned: {ownedCount + qty}
            </p>

            {/* Add to Collection Button */}
            <div className="mt-3 flex justify-center items-center">
                <AddToCollectionControl
                    quantity={qty}
                    onChange={setQty}
                />
            </div>

            {/* Add to Wishlist Button */}
            <div className="mt-3 flex justify-center items-center">
                <AddToWishlist
                    isWishlisted={wishlisted}
                    onToggle={() => setWishlisted((v) => !v)}
                />
            </div>

        </div>
    );
}