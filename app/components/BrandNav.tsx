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
            className="
        w-full h-12
        border-b border-[#42c99c] dark:border-[#82664e]
        bg-[#f1e3cc] dark:bg-[#173c3f]
        flex items-center justify-center
        px-6
        transition-all duration-300
      "
        >
            <div className="flex gap-6 justify-center text-md font-medium text-[#193f44] dark:text-[#e8d5b8]">
                {items.map((item) => {
                    const active = game === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setGame(item.key)}
                            className={[
                                "transition-colors",
                                active ? "text-[#36c293]" : "hover:text-[#36c293]",
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