"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, XIcon, ChevronLeft, ChevronRight } from "lucide-react";
import CardsCard from "./CardsCard";
import {
    type ShowFilter,
    type SortBy,
    type RarityFilter,
    type TypeFilter,
    type ManaColorFilter,
    type KeywordFilter,
    getRarityOptions,
    getTypeOptions,
    MANA_COLOR_OPTIONS,
    KEYWORD_OPTIONS,
} from "./cardFilters";

type CardItem = {
    id: string;
    name: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
};

const GAME_LABELS: Record<string, string> = {
    mtg: "Magic The Gathering",
    ptcg: "Pokémon",
    ytcg: "Yu-Gi-Oh!",
};

type PageProps = {
    params: Promise<{ game: string }>;
};


export default function GamePage({ params }: PageProps) {
    const [gameParam, setGameParam] = useState<string | null>(null);
    const gameName = gameParam ? (GAME_LABELS[gameParam] ?? gameParam.toUpperCase()) : "";

    useEffect(() => {
        params.then((p) => setGameParam(p.game));
    }, [params]);

    // Favorites per-card id
    const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ----- Filters -----
    const [showFilter, setShowFilter] = useState<ShowFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("newest");
    const [rarity, setRarity] = useState<RarityFilter>("all");
    const [type, setType] = useState<TypeFilter>("all");
    const [manaColor, setManaColor] = useState<ManaColorFilter>("all");
    const [keyword, setKeyword] = useState<KeywordFilter>("all");

    // UI: collapsible filters
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Count "active" filters so we can show a badge
    const activeFilterCount = useMemo(() => {
        let count = 0;

        if (showFilter !== "all") count++;
        if (sortBy !== "newest") count++;
        if (rarity !== "all") count++;
        if (type !== "all") count++;
        if (gameParam === "mtg" && manaColor !== "all") count++;
        if (gameParam === "mtg" && keyword !== "all") count++;

        return count;
    }, [showFilter, sortBy, rarity, type, manaColor, keyword, gameParam]);

    // Get filter options based on selected game
    const rarityOptions = useMemo(() => getRarityOptions(gameParam), [gameParam]);
    const typeOptions = useMemo(() => getTypeOptions(gameParam), [gameParam]);

    // If you switch games, keep the UI consistent by resetting game-specific filters
    useEffect(() => {
        setRarity("all");
        setType("all");
        setManaColor("all");
        setKeyword("all");
    }, [gameParam]);

    // Generate 45 test cards for each game
    const generateTestCards = (game: string | null): CardItem[] => {
        const cards: CardItem[] = [];
        const gamePrefix = game || "card";

        for (let i = 1; i <= 55; i++) {
            cards.push({
                id: `${gamePrefix}-card-${i}`,
                name: `${gameName} Card ${i}`,
                imageSrc: "/images/DeckHaven-Shield.png",
                description: `Test card ${i} for ${gameName}`,
                ownedCount: Math.floor(Math.random() * 5), // Random owned count 0-4
            });
        }

        return cards;
    };

    // Demo card data (placeholder until API is connected)
    const demoCards: CardItem[] = useMemo(() => {
        return generateTestCards(gameParam);
    }, [gameParam, gameName]);

    // Filtered items
    const filteredItems = useMemo<CardItem[]>(() => {
        let items = [...demoCards];

        // Show filter
        if (showFilter === "owned") {
            items = items.filter((item) => item.ownedCount > 0);
        } else if (showFilter === "favorited") {
            items = items.filter((item) => favorites.has(item.id));
        }

        // Sort
        items.sort((a, b) => {
            if (sortBy === "mostOwned") return b.ownedCount - a.ownedCount;
            if (sortBy === "za") return b.name.localeCompare(a.name);
            if (sortBy === "newest") return b.id.localeCompare(a.id);
            if (sortBy === "oldest") return a.id.localeCompare(b.id);
            // az (default)
            return a.name.localeCompare(b.name);
        });

        return items;
    }, [demoCards, showFilter, sortBy, rarity, type, manaColor, keyword, favorites]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 25;

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [showFilter, sortBy, rarity, type, manaColor, keyword]);

    const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false);
    const keywordDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                keywordDropdownRef.current &&
                !keywordDropdownRef.current.contains(event.target as Node)
            ) {
                setKeywordDropdownOpen(false);
            }
        };

        if (keywordDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [keywordDropdownOpen]);

    const clearFilters = () => {
        setShowFilter("all");
        setSortBy("newest");
        setRarity("all");
        setType("all");
        setManaColor("all");
        setKeyword("all");
        setKeywordDropdownOpen(false);
    };

    return (
        <main
            className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
        transition-all duration-300
      "
        >
            <section className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{gameName}</h2>
                    <p className="text-sm opacity-70 mt-1">
                        Library page placeholder — browse + filters will live here.
                    </p>
                </div>

                <Link
                    href="/cards"
                    className="
            text-sm font-medium
            px-3 py-1.5 rounded-md
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
          "
                >
                    Back to Cards
                </Link>
            </section>

            {/* Filters */}
            <section className="mb-6">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((v) => !v)}
                        className="
        inline-flex items-center gap-2
        px-3 py-1.5 rounded-md text-sm font-medium
        bg-black/5 dark:bg-white/5
        border border-[#42c99c] dark:border-[#82664e]
        hover:bg-black/10 dark:hover:bg-white/10
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
        dark:focus:ring-[#82664e]
      "
                        aria-expanded={filtersOpen}
                        aria-controls="cards-filters-panel"
                    >
                        <span>Filters</span>

                        {activeFilterCount > 0 && (
                            <span
                                className="
            ml-1 inline-flex items-center justify-center
            min-w-[22px] h-[22px] px-1
            rounded-full text-xs font-semibold
            bg-[#42c99c] dark:bg-[#82664e]
            text-white
          "
                            >
                                {activeFilterCount}
                            </span>
                        )}

                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Optional: quick clear on the right */}
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="
          text-sm opacity-80 flex items-center gap-2
          px-3 py-1.5 rounded-md
          bg-black/5 dark:bg-white/5
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-[#42c99c]
          dark:focus:ring-[#82664e]
        "
                        >
                            Clear
                            <XIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Collapsible panel */}
                <div
                    id="cards-filters-panel"
                    className={`
      mt-3 overflow-hidden transition-[max-height,opacity] duration-300 ease-out
      ${filtersOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
    `}
                >
                    <div
                        className="
        p-4 rounded-lg
        bg-black/5 dark:bg-white/5
        border border-[#42c99c] dark:border-[#82664e]
      "
                    >
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="
            text-sm opacity-80 flex items-center gap-2
            px-3 py-1.5 rounded-md
            text-[#193f44] dark:text-[#e8d5b8]
            bg-black/5 dark:bg-white/5
            border border-[#42c99c] dark:border-[#82664e]
            hover:bg-black/10 dark:hover:bg-white/10
            transition-all duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
            cursor-pointer
          "
                                onClick={clearFilters}
                            >
                                Clear Filters
                                <XIcon className="w-4 h-4" />
                            </button>

                            {/* Show */}
                            <label className="text-sm opacity-80 flex items-center gap-2">
                                Show
                                <div className="relative">
                                    <select
                                        value={showFilter}
                                        onChange={(e) => setShowFilter(e.target.value as ShowFilter)}
                                        className="
                        appearance-none rounded-md px-2 py-1 pr-7 text-sm
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        text-[#193f44] dark:text-[#e8d5b8]
                        border border-[#42c99c] dark:border-[#82664e]
                        focus:outline-none
                        focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                      "
                                    >
                                        <option value="all">All</option>
                                        <option value="owned">Owned</option>
                                        <option value="favorited">Favorited</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                </div>
                            </label>

                            {/* Rarity (game-specific) */}
                            <label className="text-sm opacity-80 flex items-center gap-2">
                                Rarity
                                <div className="relative">
                                    <select
                                        value={rarity}
                                        onChange={(e) => setRarity(e.target.value)}
                                        className="
                        appearance-none rounded-md px-2 py-1 pr-7 text-sm
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        text-[#193f44] dark:text-[#e8d5b8]
                        border border-[#42c99c] dark:border-[#82664e]
                        focus:outline-none
                        focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                      "
                                    >
                                        {rarityOptions.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                </div>
                            </label>

                            {/* Type (game-specific) */}
                            <label className="text-sm opacity-80 flex items-center gap-2">
                                Type
                                <div className="relative">
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="
                        appearance-none rounded-md px-2 py-1 pr-7 text-sm
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        text-[#193f44] dark:text-[#e8d5b8]
                        border border-[#42c99c] dark:border-[#82664e]
                        focus:outline-none
                        focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                      "
                                    >
                                        {typeOptions.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                </div>
                            </label>

                            {/* Mana Color (MTG only) */}
                            {gameParam === "mtg" && (
                                <label className="text-sm opacity-80 flex items-center gap-2">
                                    Mana Color
                                    <div className="relative">
                                        <select
                                            value={manaColor}
                                            onChange={(e) => setManaColor(e.target.value as ManaColorFilter)}
                                            className="
                            appearance-none rounded-md px-2 py-1 pr-7 text-sm
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            text-[#193f44] dark:text-[#e8d5b8]
                            border border-[#42c99c] dark:border-[#82664e]
                            focus:outline-none
                            focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                          "
                                        >
                                            {MANA_COLOR_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                    </div>
                                </label>
                            )}

                            {/* Keyword (MTG only) */}
                            {gameParam === "mtg" && (
                                <label className="text-sm opacity-80 flex items-center gap-2">
                                    Keyword
                                    <div className="relative" ref={keywordDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setKeywordDropdownOpen((v) => !v)}
                                            className="
                        rounded-md px-2 py-1 text-sm
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        text-[#193f44] dark:text-[#e8d5b8]
                        border border-[#42c99c] dark:border-[#82664e]
                        focus:outline-none
                        focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                        min-w-[120px]
                        hover:bg-[#ddd0b8] dark:hover:bg-[#1d4548]
                        transition-colors
                        flex items-center justify-between gap-2
                      "
                                        >
                                            <span className="text-left flex-1">
                                                {KEYWORD_OPTIONS.find((o) => o.value === keyword)?.label || "All"}
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-70 flex-shrink-0" />
                                        </button>

                                        {keywordDropdownOpen && (
                                            <div
                                                className="
                        absolute z-50 mt-1 w-48
                        max-h-64 overflow-y-auto
                        rounded-md
                        border border-[#42c99c] dark:border-[#82664e]
                        bg-[#f6ead6] dark:bg-[#173c3f]
                        shadow-lg
                        text-sm
                      "
                                            >
                                                {KEYWORD_OPTIONS.map((o) => (
                                                    <button
                                                        key={o.value}
                                                        type="button"
                                                        className={`
                              block w-full px-3 py-1.5 text-left
                              hover:bg-black/10 dark:hover:bg-white/10
                              transition-colors
                              ${keyword === o.value ? "bg-black dark:bg-white/5 font-medium" : ""}
                            `}
                                                        onClick={() => {
                                                            setKeyword(o.value);
                                                            setKeywordDropdownOpen(false);
                                                        }}
                                                    >
                                                        {o.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            )}

                            {/* Sort */}
                            <label className="text-sm opacity-80 flex items-center gap-2">
                                Sort
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                                        className="
                        appearance-none rounded-md px-2 py-1 pr-7 text-sm
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        text-[#193f44] dark:text-[#e8d5b8]
                        border border-[#42c99c] dark:border-[#82664e]
                        focus:outline-none
                        focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                      "
                                    >
                                        <option value="az">A–Z</option>
                                        <option value="za">Z–A</option>
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="mostOwned">Most Owned</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pagination Controls - Top */}
            {totalPages > 1 && (
                <section className="mb-6 flex items-center justify-end gap-2">
                    <p className="text-sm opacity-70">
                        Showing {filteredItems.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} card{filteredItems.length === 1 ? "" : "s"}
                    </p>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="
                            px-3 py-1.5 rounded-md
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            text-[#193f44] dark:text-[#e8d5b8]
                            border border-[#42c99c] dark:border-[#82664e]
                            hover:bg-black/10 dark:hover:bg-white/10
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                            flex items-center gap-1
                        "
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`
                                            px-3 py-1.5 rounded-md text-sm
                                            transition-colors
                                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                            dark:focus:ring-[#82664e]
                                            ${currentPage === page
                                                ? "bg-[#42c99c] dark:bg-[#82664e] text-white font-semibold"
                                                : "bg-[#e8d5b8] dark:bg-[#173c3f] text-[#193f44] dark:text-[#e8d5b8] border border-[#42c99c] dark:border-[#82664e] hover:bg-black/10 dark:hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return (
                                    <span key={page} className="px-2 text-sm opacity-50">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="
                            px-3 py-1.5 rounded-md
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            text-[#193f44] dark:text-[#e8d5b8]
                            border border-[#42c99c] dark:border-[#82664e]
                            hover:bg-black/10 dark:hover:bg-white/10
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                            flex items-center gap-1
                        "
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </section>
            )}

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {paginatedItems.map((item) => (
                    <CardsCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        game={gameParam || ""}
                        imageSrc={item.imageSrc}
                        description={item.description}
                        ownedCount={item.ownedCount}
                        isFavorited={favorites.has(item.id)}
                        onToggleFavorite={() => toggleFavorite(item.id)}
                        href={item.id ? `/cards/${gameParam}/${item.id}` : undefined}
                    />
                ))}
            </section>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
                <section className="mt-6 flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="
                            px-3 py-1.5 rounded-md
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            text-[#193f44] dark:text-[#e8d5b8]
                            border border-[#42c99c] dark:border-[#82664e]
                            hover:bg-black/10 dark:hover:bg-white/10
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                            flex items-center gap-1
                        "
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`
                                            px-3 py-1.5 rounded-md text-sm
                                            transition-colors
                                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                            dark:focus:ring-[#82664e]
                                            ${currentPage === page
                                                ? "bg-[#42c99c] dark:bg-[#82664e] text-white font-semibold"
                                                : "bg-[#e8d5b8] dark:bg-[#173c3f] text-[#193f44] dark:text-[#e8d5b8] border border-[#42c99c] dark:border-[#82664e] hover:bg-black/10 dark:hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return (
                                    <span key={page} className="px-2 text-sm opacity-50">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="
                            px-3 py-1.5 rounded-md
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            text-[#193f44] dark:text-[#e8d5b8]
                            border border-[#42c99c] dark:border-[#82664e]
                            hover:bg-black/10 dark:hover:bg-white/10
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                            flex items-center gap-1
                        "
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </section>
            )}
        </main>
    );
}