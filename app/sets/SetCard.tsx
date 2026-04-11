/**
 * Set Card Component
 * 
 * Displays a single set card with favorite functionality. Used in the "My Sets" page
 * to show user's tracked sets. Includes a favorite button and displays set information
 * including name, icon, description, owned/total counts, and release date.
 * 
 * @component
 * @example
 * <SetCard
 *   name="Throne of Eldraine"
 *   game="Magic the Gathering"
 *   imageSrc="/set-icon.svg"
 *   ownedCount={50}
 *   totalCount={269}
 *   isFavorited={true}
 *   onToggleFavorite={() => toggleFavorite()}
 * />
 */

"use client";

import { useRouter } from "next/navigation";

export type SetCardProps = {
  id?: string;
  href?: string;
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
  href,
  name,
  game,
  imageSrc,
  description,
  ownedCount,
  totalCount,
  releaseDate,
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
        relative min-w-0 cursor-pointer rounded-lg
        border border-[var(--theme-border)]
        bg-[var(--theme-sidebar)]
        p-3 md:p-4
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        hover:border-[var(--theme-accent-hover)]
        hover:shadow-[0_0_20px_var(--theme-accent)]/20
      "
    >
      {/* Set Name */}
      <div className="w-full border-b border-[var(--theme-border)] pb-2">
        <h3 className="truncate text-center text-sm font-semibold md:text-lg">
          {name}
        </h3>
      </div>

      {/* Game Badge - desktop only */}
      {game && (
        <div className="mt-1 hidden justify-center md:flex">
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs dark:bg-white/10">
            {game}
          </span>
        </div>
      )}

      {/* Set Icon */}
      {imageSrc && (
        <div className="mt-2 flex justify-center md:mt-3">
          <img
            src={imageSrc}
            alt={name}
            className="h-8 w-8 md:h-10 md:w-10
              [filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1000%)_hue-rotate(130deg)_brightness(0.9)]
              dark:[filter:brightness(0)_saturate(100%)_invert(50%)_sepia(20%)_saturate(500%)_hue-rotate(10deg)_brightness(1.1)]
            "
          />
        </div>
      )}

      {/* Description - desktop only */}
      {description && (
        <p className="mt-3 hidden text-center text-sm opacity-80 md:block">
          {description}
        </p>
      )}

      {/* Owned Count */}
      {typeof ownedCount === "number" && (
        <p className="mt-2 text-center text-xs opacity-80 md:text-sm">
          {typeof totalCount === "number"
            ? `${ownedCount} / ${totalCount}`
            : `${ownedCount} cards`}
        </p>
      )}

      {/* Release Date - desktop only */}
      {releaseDate && (
        <p className="mt-1 hidden text-center text-xs opacity-60 md:block">
          Released: {releaseDate}
        </p>
      )}
    </div>
  );
}
