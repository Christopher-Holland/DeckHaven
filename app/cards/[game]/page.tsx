"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    ChevronDown,
    XIcon,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

    // Count "active" filters for badge
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

    const rarityOptions = useMemo(() => getRarityOptions(gameParam), [gameParam]);
    const typeOptions = useMemo(() => getTypeOptions(gameParam), [gameParam]);

    // Reset game-specific filters on game change
    useEffect(() => {
        setRarity("all");
        setType("all");
        setManaColor("all");
        setKeyword("all");
        setFiltersOpen(false); // optional: close filters when switching games
    }, [gameParam]);

    // Generate test cards
    const generateTestCards = (game: string | null): CardItem[] => {
        const cards: CardItem[] = [];
        const gamePrefix = game || "card";

        for (let i = 1; i <= 55; i++) {
            cards.push({
                id: `${gamePrefix}-card-${i}`,
                name: `${gameName} Card ${i}`,
                imageSrc: "/images/DeckHaven-Shield.png",
                description: `Test card ${i} for ${gameName}`,
                ownedCount: Math.floor(Math.random() * 5),
            });
        }

        return cards;
    };

    const demoCards: CardItem[] = useMemo(() => generateTestCards(gameParam), [gameParam, gameName]);

    // Filtered items (currently only show + sort; others are wired for later)
    const filteredItems = useMemo<CardItem[]>(() => {
        let items = [...demoCards];

        if (showFilter === "owned") {
            items = items.filter((item) => item.ownedCount > 0);
        } else if (showFilter === "favorited") {
            items = items.filter((item) => favorites.has(item.id));
        }

        items.sort((a, b) => {
            if (sortBy === "mostOwned") return b.ownedCount - a.ownedCount;
            if (sortBy === "za") return b.name.localeCompare(a.name);
            if (sortBy === "newest") return b.id.localeCompare(a.id);
            if (sortBy === "oldest") return a.id.localeCompare(b.id);
            return a.name.localeCompare(b.name);
        });

        return items;
    }, [demoCards, showFilter, sortBy, rarity, type, manaColor, keyword, favorites]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 25;

    const totalPages = Math.ceil(filteredItems.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [showFilter, sortBy, rarity, type, manaColor, keyword]);

    // Keyword search
    const [keywordSearch, setKeywordSearch] = useState("");

    // Update search input when keyword changes externally
    useEffect(() => {
        if (keyword === "all") {
            setKeywordSearch("");
        } else {
            const keywordOption = KEYWORD_OPTIONS.find((o) => o.value === keyword);
            if (keywordOption) {
                setKeywordSearch(keywordOption.label);
            } else {
                // If keyword is a custom value, show it in the input
                setKeywordSearch(keyword);
            }
        }
    }, [keyword]);

    const clearFilters = () => {
        setShowFilter("all");
        setSortBy("newest");
        setRarity("all");
        setType("all");
        setManaColor("all");
        setKeyword("all");
        setKeywordSearch("");
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
                        <SlidersHorizontal className="w-4 h-4 opacity-80" />
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

                {/* Animated collapsible panel */}
                <AnimatePresence initial={false}>
                    {filtersOpen && (
                        <motion.div
                            id="cards-filters-panel"
                            key="filters-panel"
                            initial={{ height: 0, opacity: 0, y: -8 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-visible"
                        >
                            <motion.div
                                initial={{ scale: 0.98 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.98 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="
                  mt-3 p-4 rounded-lg
                  bg-black/5 dark:bg-white/5
                  border border-[#42c99c] dark:border-[#82664e]
                  overflow-visible
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

                                    {/* Rarity */}
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

                                    {/* Type */}
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
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={keywordSearch}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setKeywordSearch(value);
                                                        // If input is cleared, reset to "all"
                                                        if (!value.trim()) {
                                                            setKeyword("all");
                                                        } else {
                                                            // Set keyword to the typed value
                                                            setKeyword(value.toLowerCase());
                                                        }
                                                    }}
                                                    placeholder="Search keywords..."
                                                    className="
                            rounded-md pl-8 pr-8 py-1 text-sm w-48
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            text-[#193f44] dark:text-[#e8d5b8]
                            border border-[#42c99c] dark:border-[#82664e]
                            focus:outline-none
                            focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                            placeholder:opacity-50
                          "
                                                />
                                                {keywordSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setKeywordSearch("");
                                                            setKeyword("all");
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                                                    >
                                                        <XIcon className="w-4 h-4" />
                                                    </button>
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
                                                <option value="Card # (asc)">Card # (asc)</option>
                                                <option value="Card # (desc)">Card # (desc)</option>
                                                <option value="rarity (asc)">Rarity (asc)</option>
                                                <option value="rarity (desc)">Rarity (desc)</option>
                                                <option value="newest">Newest</option>
                                                <option value="oldest">Oldest</option>
                                                <option value="mostOwned">Most Owned</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70 pointer-events-none" />
                                        </div>
                                    </label>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Pagination Controls - Top */}
            {totalPages > 1 && (
                <section className="mb-6 flex items-center justify-end gap-2">
                    <p className="text-sm opacity-70">
                        Showing {filteredItems.length > 0 ? startIndex + 1 : 0}-
                        {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} card
                        {filteredItems.length === 1 ? "" : "s"}
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