// src/components/layout/BrandNav.tsx
"use client";

export default function BrandNav() {
    return (
        <nav className="
            w-full h-12
            border-b border-[#42c99c] dark:border-[#82664e]
            bg-[#f1e3cc] dark:bg-[#173c3f]
            flex items-center justify-center
            px-6
        ">
            <div className="flex gap-6 justify-center text-sm font-medium text-[#193f44] dark:text-[#e8d5b8]">
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