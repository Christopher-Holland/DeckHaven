/**
 * Navigation Bar Component
 * 
 * Top navigation bar displaying the DeckHaven logo, search bar,
 * and user profile button. Appears on all pages except the landing page.
 * 
 * @component
 */

"use client";

import { Suspense } from "react";
import { useState, FormEvent } from "react";
import { useSidebar } from "./SidebarContext";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";

function NavbarContent() {
    const { isCollapsed } = useSidebar();
    const user = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    return (
        <header className="h-20 w-full border-b border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-fg)] grid grid-cols-3 items-center px-6 transition-all duration-300">

            {/* Left: Logo */}
            <div className="flex items-center">
                <h1 className="text-lg font-bold text-[var(--theme-fg)]">
                    DeckHaven
                </h1>
            </div>

            {/* Center: Search Bar */}
            <div className="flex justify-center">
                <div className="hidden md:block w-full max-w-2xl">
                    <form onSubmit={handleSearch} className="w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search cards, decks..."
                            className="w-full px-4 py-1.5 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60
                           focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                        />
                    </form>
                </div>
            </div>

            {/* Right: User Profile */}
            <div className="flex items-center justify-end gap-4">
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
                                bg-[var(--theme-card)]
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
                            bg-[var(--theme-card)]
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
            <header className="h-20 w-full border-b border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-fg)] grid grid-cols-3 items-center px-6 transition-all duration-300">
                <div className="flex items-center">
                    <h1 className="text-lg font-bold text-[var(--theme-fg)]">
                        DeckHaven
                    </h1>
                </div>
                <div className="flex justify-center">
                    <div className="hidden md:block w-full max-w-2xl">
                        <input
                            type="text"
                            placeholder="Search cards, decks..."
                            className="w-full px-4 py-1.5 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
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
