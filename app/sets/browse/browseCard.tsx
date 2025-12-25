/**
 * Browse Set Card Component
 * 
 * Displays a single set card in the browse sets page. Shows set name, icon,
 * description, owned/total card counts, and release date. Clickable to navigate
 * to the set detail page. Includes CSS filters to recolor set icons for better
 * visibility in both light and dark themes.
 * 
 * @component
 * @example
 * <SetCard
 *   name="Throne of Eldraine"
 *   game="Magic the Gathering"
 *   imageSrc="/set-icon.svg"
 *   ownedCount={50}
 *   totalCount={269}
 *   href="/sets/eld"
 * />
 */

"use client";

import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export type SetCardProps = {
    /** Unique identifier for the set */
    id?: string;
    /** URL to navigate to when card is clicked */
    href?: string;
    /** Set name */
    name: string;
    /** Game name (e.g., "Magic the Gathering") */
    game?: string;
    /** URL to set icon image */
    imageSrc?: string;
    /** Set description or type */
    description?: string;
    /** Number of cards owned from this set */
    ownedCount?: number;
    /** Total number of cards in the set */
    totalCount?: number;
    /** Formatted release date string */
    releaseDate?: string;
    /** Whether the set is favorited */
    isFavorited?: boolean;
    /** Callback when favorite status is toggled */
    onToggleFavorite?: () => void;
};

export default function SetCard({
    id,
    href,
    name,
    game,
    imageSrc,
    description,
    ownedCount,
    totalCount,
    releaseDate,
    isFavorited = false,
    onToggleFavorite,
}: SetCardProps) {
    const router = useRouter();

    const handleNavigate = () => {
        if (href) router.push(href);
    };

    return (
        <div
            onClick={handleNavigate}
            onKeyDown={(e) => {
                if (!href) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNavigate();
                }
            }}
            role={href ? "button" : undefined}
            tabIndex={href ? 0 : undefined}
            className="
        relative rounded-lg
        border border-[#42c99c] dark:border-[#82664e]
        bg-[#e8d5b8] dark:bg-[#173c3f]
        p-4
        min-h-[300px]
        flex flex-col
        cursor-pointer
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        hover:border-[#2fbf8f]
        dark:hover:border-[#9b7a5f]
        hover:shadow-[0_0_20px_rgba(130,102,78,0.2)]
        dark:hover:shadow-[0_0_30px_rgba(66,201,156,0.35)]
      "
        >
            {/* Set Name */}
            <div className="w-full mb-2 border-b border-[#42c99c] dark:border-[#82664e] pb-2 flex-shrink-0">
                <h3 className="text-lg font-semibold text-center line-clamp-3 min-h-[3.5rem] flex items-center justify-center">
                    {name}
                </h3>
            </div>

            {/* Game Badge */}
            {game && (
                <div className="flex justify-center mt-1 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-[#42c99c] dark:border-[#82664e] bg-black/10 dark:bg-white/10">
                        {game}
                    </span>
                </div>
            )}

            {/* Set Icon with CSS filters for colorization */}
            {imageSrc && (
                <div className="flex justify-center mt-4 flex-shrink-0">
                    <img
                        src={imageSrc}
                        alt={name}
                        className="w-16 h-16 
                            [filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1000%)_hue-rotate(130deg)_brightness(0.9)]
                            dark:[filter:brightness(0)_saturate(100%)_invert(50%)_sepia(20%)_saturate(500%)_hue-rotate(10deg)_brightness(1.1)]
                        "
                    />
                </div>
            )}

            {/* Set Description */}
            {description && (
                <p className="text-sm opacity-80 text-center mt-3 line-clamp-2 flex-grow">
                    {description}
                </p>
            )}

            {/* Spacer to push bottom content down */}
            <div className="flex-grow" />

            {/* Owned Card Count */}
            {typeof ownedCount === "number" && (
                <p className="text-sm opacity-80 text-center mt-2 flex-shrink-0">
                    {typeof totalCount === "number"
                        ? `${ownedCount} out of ${totalCount} cards`
                        : `${ownedCount} cards`}
                </p>
            )}

            {/* Release Date */}
            {releaseDate && (
                <p className="text-xs opacity-60 text-center mt-1 flex-shrink-0">
                    Released: {releaseDate}
                </p>
            )}
        </div>
    );
}
