/**
 * Navigation Bar Component
 * 
 * Top navigation bar displaying the DeckHaven logo, search bar, theme toggle,
 * and user profile button. Appears on all pages except the landing page.
 * 
 * @component
 */

"use client";

import { Suspense } from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSidebar } from "./SidebarContext";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";

function NavbarContent() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { isCollapsed } = useSidebar();
    const user = useUser();
    const router = useRouter();

    // Prevent hydration mismatch by only rendering theme-dependent UI after mount
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
        <header className="h-20 w-full border-b border-[var(--theme-border)] bg-[var(--theme-sidebar)] text-[var(--theme-fg)] grid grid-cols-3 items-center px-6 transition-all duration-300">

            {/* Left: Logo */}
            <div className="flex items-center">
                <h1 className="text-lg font-bold text-[var(--theme-accent)]">
                    DeckHaven
                </h1>
            </div>

            {/* Center: Search Bar */}
            <div className="flex justify-center">
                <div className="hidden md:block">
                    <input
                        type="text"
                        placeholder="Search cards, decks..."
                        className="px-20 py-1.5 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60
                       focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                    />
                </div>
            </div>

            {/* Right: Theme Toggle & User Profile */}
            <div className="flex items-center justify-end gap-4">
                <button
                    onClick={toggleTheme}
                    className="h-8 w-8 rounded-full bg-[var(--theme-card)] text-[var(--theme-fg)]
                       flex items-center justify-center text-sm font-medium hover:bg-[var(--theme-accent)] hover:text-white transition-colors cursor-pointer relative z-10"
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
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {user.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt={user.displayName || "User"}
                                    className="h-8 w-8 rounded-full"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-[var(--theme-accent)] text-white flex items-center justify-center text-sm font-medium">
                                    {user.displayName?.[0] || user.primaryEmail?.[0] || "U"}
                                </div>
                            )}
                            <span className="text-sm hidden md:block">
                                {user.displayName || user.primaryEmail?.split("@")[0] || "User"}
                            </span>
                        </div>
                        <button
                            onClick={async () => {
                                await user.signOut();
                                router.push("/");
                            }}
                            className="
                                px-3 py-1.5 rounded-md text-sm
                                bg-[var(--theme-sidebar)]
                                border border-[var(--theme-border)]
                                hover:bg-[var(--theme-accent)] hover:text-white
                                transition-colors
                            "
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => router.push("/auth/signin")}
                        className="
                            px-3 py-1.5 rounded-md text-sm
                            bg-[var(--theme-sidebar)]
                            border border-[var(--theme-border)]
                            hover:bg-[var(--theme-accent)] hover:text-white
                            transition-colors
                        "
                    >
                        Sign In
                    </button>
                )}
            </div>
        </header>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={
            <header className="h-20 w-full border-b border-[var(--theme-border)] bg-[var(--theme-sidebar)] text-[var(--theme-fg)] grid grid-cols-3 items-center px-6 transition-all duration-300">
                <div className="flex items-center">
                    <h1 className="text-lg font-bold text-[var(--theme-accent)]">
                        DeckHaven
                    </h1>
                </div>
                <div className="flex justify-center">
                    <div className="hidden md:block">
                        <input
                            type="text"
                            placeholder="Search cards, decks..."
                            className="px-20 py-1.5 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                            disabled
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4">
                    <div className="h-8 w-8 rounded-full bg-[var(--theme-card)] animate-pulse" />
                </div>
            </header>
        }>
            <NavbarContent />
        </Suspense>
    );
}
