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

import { useMemo } from "react";
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

    // Use same-origin URL for mask (proxy external Scryfall icons so they match theme text color)
    const maskImageUrl = useMemo(() => {
        if (!imageSrc) return null;
        if (imageSrc.startsWith("http")) {
            return `/api/scryfall/proxy-image?url=${encodeURIComponent(imageSrc)}`;
        }
        return imageSrc;
    }, [imageSrc]);

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
        border border-[var(--theme-border)]
        bg-[var(--theme-sidebar)]
        p-4
        min-h-[300px]
        flex flex-col
        cursor-pointer
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        hover:border-[var(--theme-accent-hover)]
        hover:shadow-[0_0_20px_rgba(130,102,78,0.2)]
        dark:hover:shadow-[0_0_30px_rgba(66,201,156,0.35)]
      "
        >
            {/* Set Name */}
            <div className="w-full mb-2 border-b border-[var(--theme-border)] pb-2 flex-shrink-0">
                <h3 className="text-lg font-semibold text-center line-clamp-3 min-h-[3.5rem] flex items-center justify-center">
                    {name}
                </h3>
            </div>

            {/* Game Badge */}
            {game && (
                <div className="flex justify-center mt-1 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--theme-border)] bg-black/10 dark:bg-white/10">
                        {game}
                    </span>
                </div>
            )}

            {/* Set Icon — same color as text via mask + currentColor (proxied when external so mask works) */}
            {imageSrc && maskImageUrl && (
                <div className="flex justify-center mt-4 flex-shrink-0 text-[var(--theme-fg)]">
                    <div
                        className="w-16 h-16 opacity-95"
                        style={{         
                            backgroundColor: "currentColor",
                            WebkitMaskImage: `url(${maskImageUrl})`,
                            maskImage: `url(${maskImageUrl})`,
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                        }}
                        role="img"
                        aria-label={name}
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
