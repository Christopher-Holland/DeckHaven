/**
 * Brand Navigation Component
 * 
 * Secondary navigation bar displaying game selection buttons (Magic, Pokémon, Yu-Gi-Oh!).
 * Appears below the main navbar on all pages except the landing page.
 * Currently displays game options (functionality to be implemented).
 * 
 * @component
 */

"use client";

import { useSidebar } from "./SidebarContext";
import { useGameFilter, GameKey } from "./GameFilterContext";

const items: { key: GameKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "mtg", label: "Magic the Gathering" },
    { key: "pokemon", label: "Pokémon" },
    { key: "yugioh", label: "Yu-Gi-Oh!" },
];

export default function BrandNav() {
    const { isCollapsed } = useSidebar(); // keeping since you already had it
    const { game, setGame } = useGameFilter();

    return (
        <nav
            aria-label="Select game"
            className="
        w-full h-12
        border-b border-[var(--theme-border)]
        bg-[var(--theme-bg)]
        flex items-center justify-center
        px-6
        transition-all duration-300
      "
        >
            <div className="flex gap-6 justify-center text-md font-medium text-[var(--theme-fg)]">
                {items.map((item) => {
                    const active = game === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setGame(item.key)}
                            className={[
                                "transition-colors",
                                active ? "text-[var(--theme-accent-text)] underline font-semibold" : "hover:text-[var(--theme-accent-text)]",
                            ].join(" ")}
                            aria-current={active ? "page" : undefined}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}