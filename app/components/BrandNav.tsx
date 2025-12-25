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

export default function BrandNav() {
    const { isCollapsed } = useSidebar();

    return (
        <nav className="
            w-full h-12
            border-b border-[#42c99c] dark:border-[#82664e]
            bg-[#f1e3cc] dark:bg-[#173c3f]
            flex items-center justify-center
            px-6
            transition-all duration-300
        ">
            <div className="flex gap-6 justify-center text-md font-medium text-[#193f44] dark:text-[#e8d5b8]">
                <button className="hover:text-[#36c293] transition-colors">
                    Magic the Gathering
                </button>
                <button className="hover:text-[#36c293] transition-colors">
                    Pokémon
                </button>
                <button className="hover:text-[#36c293] transition-colors">
                    Yu-Gi-Oh!
                </button>
            </div>
        </nav>
    );
}
