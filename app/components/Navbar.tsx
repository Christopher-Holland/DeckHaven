/**
 * Navigation Bar Component
 *
 * Top navigation bar displaying the DeckHaven logo, search bar,
 * and user profile button. Search shows results from cards, sets,
 * deck names, and binders in a dropdown.
 *
 * @component
 */

"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { FormEvent } from "react";
import { useSidebar } from "./SidebarContext";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { Search, Layout, BookOpen, Folder, Layers } from "lucide-react";
import type { ScryfallCard } from "@/app/lib/scryfall";

type SearchResultSet = {
    id: string;
    code: string;
    name: string;
};

type SearchResultDeck = {
    id: string;
    name: string;
    totalCards: number;
};

type SearchResultBinder = {
    id: string;
    name: string;
    _count: { binderCards: number };
};

type SearchResults = {
    cards: ScryfallCard[];
    sets: SearchResultSet[];
    decks: SearchResultDeck[];
    binders: SearchResultBinder[];
};

function NavbarContent() {
    const user = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search query (300ms)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch search results when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults(null);
            return;
        }

        let cancelled = false;
        setLoading(true);

        fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) {
                    setResults({
                        cards: data.cards || [],
                        sets: data.sets || [],
                        decks: data.decks || [],
                        binders: data.binders || [],
                    });
                }
            })
            .catch(() => {
                if (!cancelled) setResults(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    // Show dropdown when we have a query
    useEffect(() => {
        setIsOpen(debouncedQuery.length >= 2);
        setFocusedIndex(-1);
    }, [debouncedQuery]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasResults =
        results &&
        (results.cards.length > 0 ||
            results.sets.length > 0 ||
            results.decks.length > 0 ||
            results.binders.length > 0);

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setIsOpen(false);
        }
    };

    const handleSelect = useCallback(
        (href: string) => {
            router.push(href);
            setSearchQuery("");
            setIsOpen(false);
        },
        [router]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        const flatItems: { href?: string; action?: () => void }[] = [];
        if (results) {
            results.cards.forEach((c) =>
                flatItems.push({ href: `/search?q=${encodeURIComponent(c.name)}` })
            );
            results.sets.forEach((s) => flatItems.push({ href: `/sets/${s.code}` }));
            results.decks.forEach((d) => flatItems.push({ href: `/decks/${d.id}` }));
            results.binders.forEach((b) =>
                flatItems.push({ href: `/collection/binders/${b.id}` })
            );
        }
        if (searchQuery.trim()) {
            flatItems.push({
                action: () => {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                    setIsOpen(false);
                },
            });
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((i) => (i < flatItems.length - 1 ? i + 1 : i));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((i) => (i > 0 ? i - 1 : -1));
        } else if (e.key === "Enter" && focusedIndex >= 0 && flatItems[focusedIndex]) {
            e.preventDefault();
            const item = flatItems[focusedIndex];
            if (item.action) item.action();
            else if (item.href) handleSelect(item.href);
        } else if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <header className="h-20 w-full border-b border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-fg)] grid grid-cols-3 items-center px-6 transition-all duration-300">
            {/* Left: Logo */}
            <div className="flex items-center">
                <h1 className="text-lg font-bold text-[var(--theme-fg)]">DeckHaven</h1>
            </div>

            {/* Center: Search Bar with Dropdown */}
            <div className="flex justify-center">
                <div ref={containerRef} className="hidden md:block w-full max-w-2xl relative">
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search cards, sets, decks, binders..."
                                className="w-full pl-9 pr-4 py-1.5 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                            />
                        </div>
                    </form>

                    {/* Search Results Dropdown */}
                    {isOpen && (
                        <div
                            className="absolute top-full left-0 right-0 mt-1 max-h-[min(70vh,400px)] overflow-y-auto rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-lg z-50"
                            role="listbox"
                        >
                            {loading ? (
                                <div className="px-4 py-6 text-center text-sm opacity-70">
                                    Searching...
                                </div>
                            ) : !hasResults ? (
                                <div className="px-4 py-6 text-center text-sm opacity-70">
                                    No results. Try a different search or press Enter for full search.
                                </div>
                            ) : (
                                <div className="py-2">
                                    {results.cards.length > 0 && (
                                        <div className="px-2 pb-1">
                                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider opacity-60">
                                                Cards
                                            </p>
                                            {results.cards.map((card, i) => {
                                                const idx = i;
                                                const isFocused = focusedIndex === idx;
                                                return (
                                                    <button
                                                        key={card.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isFocused}
                                                        onClick={() =>
                                                            handleSelect(
                                                                `/search?q=${encodeURIComponent(card.name)}`
                                                            )
                                                        }
                                                        onMouseEnter={() => setFocusedIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                                                            isFocused
                                                                ? "bg-[var(--theme-accent)]/20"
                                                                : "hover:bg-black/5 dark:hover:bg-white/5"
                                                        }`}
                                                    >
                                                        <Layout className="w-4 h-4 shrink-0 opacity-60" />
                                                        <span className="truncate">{card.name}</span>
                                                        {card.set_name && (
                                                            <span className="ml-auto text-xs opacity-60 truncate max-w-[8rem]">
                                                                {card.set_name}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {results.sets.length > 0 && (
                                        <div className="px-2 pb-1">
                                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider opacity-60">
                                                Sets
                                            </p>
                                            {results.sets.map((set, i) => {
                                                const idx = results.cards.length + i;
                                                const isFocused = focusedIndex === idx;
                                                return (
                                                    <button
                                                        key={set.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isFocused}
                                                        onClick={() =>
                                                            handleSelect(`/sets/${set.code}`)
                                                        }
                                                        onMouseEnter={() => setFocusedIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                                                            isFocused
                                                                ? "bg-[var(--theme-accent)]/20"
                                                                : "hover:bg-black/5 dark:hover:bg-white/5"
                                                        }`}
                                                    >
                                                        <Layers className="w-4 h-4 shrink-0 opacity-60" />
                                                        <span className="truncate">{set.name}</span>
                                                        <span className="ml-auto text-xs opacity-60">
                                                            {set.code}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {results.decks.length > 0 && (
                                        <div className="px-2 pb-1">
                                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider opacity-60">
                                                Decks
                                            </p>
                                            {results.decks.map((deck, i) => {
                                                const idx =
                                                    results.cards.length +
                                                    results.sets.length +
                                                    i;
                                                const isFocused = focusedIndex === idx;
                                                return (
                                                    <button
                                                        key={deck.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isFocused}
                                                        onClick={() =>
                                                            handleSelect(`/decks/${deck.id}`)
                                                        }
                                                        onMouseEnter={() => setFocusedIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                                                            isFocused
                                                                ? "bg-[var(--theme-accent)]/20"
                                                                : "hover:bg-black/5 dark:hover:bg-white/5"
                                                        }`}
                                                    >
                                                        <BookOpen className="w-4 h-4 shrink-0 opacity-60" />
                                                        <span className="truncate">{deck.name}</span>
                                                        <span className="ml-auto text-xs opacity-60">
                                                            {deck.totalCards} cards
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {results.binders.length > 0 && (
                                        <div className="px-2 pb-1">
                                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider opacity-60">
                                                Binders
                                            </p>
                                            {results.binders.map((binder, i) => {
                                                const idx =
                                                    results.cards.length +
                                                    results.sets.length +
                                                    results.decks.length +
                                                    i;
                                                const isFocused = focusedIndex === idx;
                                                return (
                                                    <button
                                                        key={binder.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isFocused}
                                                        onClick={() =>
                                                            handleSelect(
                                                                `/collection/binders/${binder.id}`
                                                            )
                                                        }
                                                        onMouseEnter={() => setFocusedIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                                                            isFocused
                                                                ? "bg-[var(--theme-accent)]/20"
                                                                : "hover:bg-black/5 dark:hover:bg-white/5"
                                                        }`}
                                                    >
                                                        <Folder className="w-4 h-4 shrink-0 opacity-60" />
                                                        <span className="truncate">
                                                            {binder.name}
                                                        </span>
                                                        <span className="ml-auto text-xs opacity-60">
                                                            {binder._count.binderCards} cards
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-[var(--theme-border)]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (searchQuery.trim()) {
                                                    router.push(
                                                        `/search?q=${encodeURIComponent(searchQuery.trim())}`
                                                    );
                                                    setSearchQuery("");
                                                    setIsOpen(false);
                                                }
                                            }}
                                            onMouseEnter={() =>
                                                setFocusedIndex(
                                                    results.cards.length +
                                                        results.sets.length +
                                                        results.decks.length +
                                                        results.binders.length
                                                )
                                            }
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                                                focusedIndex ===
                                                results.cards.length +
                                                    results.sets.length +
                                                    results.decks.length +
                                                    results.binders.length
                                                    ? "bg-[var(--theme-accent)]/20 opacity-100"
                                                    : "opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <Search className="w-4 h-4 shrink-0" />
                                            View all results for &quot;{searchQuery}&quot;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
        <Suspense
            fallback={
                <header className="h-20 w-full border-b border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-fg)] grid grid-cols-3 items-center px-6 transition-all duration-300">
                    <div className="flex items-center">
                        <h1 className="text-lg font-bold text-[var(--theme-fg)]">DeckHaven</h1>
                    </div>
                    <div className="flex justify-center">
                        <div className="hidden md:block w-full max-w-2xl">
                            <input
                                placeholder="Search cards, sets, decks, binders..."
                                className="w-full px-4 py-1.5 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <div className="h-8 w-8 rounded-full bg-[var(--theme-card)] animate-pulse" />
                    </div>
                </header>
            }
        >
            <NavbarContent />
        </Suspense>
    );
}
