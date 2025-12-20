"use client";

import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export type SetCardProps = {
    id?: string; // optional but recommended
    href?: string; // <-- new
    name: string;
    game?: string;
    imageSrc?: string;
    description?: string;
    ownedCount?: number;
    totalCount?: number;
    releaseDate?: string;

    isFavorited?: boolean;
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
                aria-label={isFavorited ? "Unfavorite set" : "Favorite set"}
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

            {/* Title */}
            <div className="w-full mb-2 border-b border-[#42c99c] dark:border-[#82664e] pb-2">
                <h3 className="text-lg font-semibold text-center px-12 truncate">
                    {name}
                </h3>
            </div>

            {/* Game badge */}
            {game && (
                <div className="flex justify-center mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                        {game}
                    </span>
                </div>
            )}

            {/* Image */}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={name}
                    className="w-10 h-10 mx-auto mt-3"
                />
            )}

            {/* Description */}
            {description && (
                <p className="text-sm opacity-80 text-center mt-3">
                    {description}
                </p>
            )}

            {/* Owned count */}
            {typeof ownedCount === "number" && (
                <p className="text-sm opacity-80 text-center mt-2">
                    {typeof totalCount === "number"
                        ? `${ownedCount} out of ${totalCount} cards`
                        : `${ownedCount} cards`}
                </p>
            )}

            {/* Release date */}
            {releaseDate && (
                <p className="text-xs opacity-60 text-center mt-1">
                    Released: {releaseDate}
                </p>
            )}
        </div>
    );
}