// src/components/layout/Navbar.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (!setTheme) {
            return;
        }
        
        // Use resolvedTheme if available, otherwise fall back to theme
        const currentTheme = resolvedTheme || theme || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    // Determine which icon to show - use resolvedTheme for accurate display
    const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

    return (
        <header className="h-14 w-full border-b border-gray-200 dark:border-gray-800 bg-zinc-50 dark:bg-[#113033] text-gray-900 dark:text-white grid grid-cols-3 items-center px-6">

            {/* Left */}
            <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    DeckHaven
                </h1>
            </div>

            {/* Center */}
            <div className="flex justify-center">
                <div className="hidden md:block">
                    <input
                        type="text"
                        placeholder="Search cards, decks..."
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center justify-end gap-4">
                <button
                    onClick={toggleTheme}
                    className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                       flex items-center justify-center text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer relative z-10"
                    aria-label="Toggle theme"
                    type="button"
                >
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
                <button className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white
                           flex items-center justify-center text-sm font-medium">
                    U
                </button>
            </div>

        </header>
    );
}