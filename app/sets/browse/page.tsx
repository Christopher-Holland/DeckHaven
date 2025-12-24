"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ChevronLeft, ChevronRight } from "lucide-react";
import SetCard from "./browseCard";

type ScryfallSet = {
    id: string;
    code: string;
    name: string;
    released_at?: string;
    set_type?: string;
    icon_svg_uri?: string;
    card_count?: number;
};

type GameFilter = "all" | string;
type ShowFilter = "all" | "owned" | "favorited";
type SortBy = "az" | "za" | "newest" | "oldest" | "mostOwned";

export default function BrowseSets() {
    const router = useRouter();

    // State
    const [sets, setSets] = useState<ScryfallSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const setsPerPage = 25;

    // Filters
    const [gameFilter, setGameFilter] = useState<GameFilter>("all");
    const [showFilter, setShowFilter] = useState<ShowFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("newest");

    // Fetch sets from Scryfall
    useEffect(() => {
        async function fetchSets() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("/api/scryfall/sets");
                if (!response.ok) {
                    throw new Error("Failed to fetch sets");
                }
                const data = await response.json();
                
                // Filter for Magic the Gathering sets
                // MTG sets typically have set_type: "expansion", "core", "commander", "draft_innovation", etc.
                const mtgSetTypes = [
                    "expansion",
                    "core",
                    "commander",
                    "draft_innovation",
                    "masters",
                    "masterpiece",
                    "arsenal",
                    "from_the_vault",
                    "spellbook",
                    "premium_deck",
                    "duel_deck",
                    "starter",
                    "box",
                    "promo",
                    "token",
                    "memorabilia",
                    "planechase",
                    "archenemy",
                    "vanguard",
                    "funny",
                    "treasure_chest",
                ];
                
                const mtgSets = data.data.filter((set: ScryfallSet) =>
                    mtgSetTypes.includes(set.set_type || "")
                );

                setSets(mtgSets);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load sets");
            } finally {
                setLoading(false);
            }
        }

        fetchSets();
    }, []);

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Filter and sort sets
    const filteredSets = useMemo(() => {
        let items = [...sets];

        // Show filter (for future database integration)
        if (showFilter === "owned") {
            // Will filter by owned sets from database later
            items = items.filter(() => false); // Empty for now
        } else if (showFilter === "favorited") {
            items = items.filter((s) => favorites.has(s.id));
        }

        // Sort
        items.sort((a, b) => {
            if (sortBy === "mostOwned") {
                // Will sort by owned count from database later
                return 0;
            }
            if (sortBy === "az") {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "za") {
                return b.name.localeCompare(a.name);
            }
            if (sortBy === "newest") {
                // Sort by release date, most recent first
                const dateA = a.released_at ? new Date(a.released_at).getTime() : 0;
                const dateB = b.released_at ? new Date(b.released_at).getTime() : 0;
                return dateB - dateA; // Descending (newest first)
            }
            if (sortBy === "oldest") {
                // Sort by release date, oldest first
                const dateA = a.released_at ? new Date(a.released_at).getTime() : 0;
                const dateB = b.released_at ? new Date(b.released_at).getTime() : 0;
                return dateA - dateB; // Ascending (oldest first)
            }
            return 0;
        });

        return items;
    }, [sets, showFilter, sortBy, favorites]);

    // Pagination
    const totalPages = Math.ceil(filteredSets.length / setsPerPage);
    const startIndex = (currentPage - 1) * setsPerPage;
    const endIndex = startIndex + setsPerPage;
    const paginatedSets = filteredSets.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [showFilter, sortBy]);

    // Format release date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
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
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-lg opacity-70">Loading sets...</p>
                </div>
            </main>
        );
    }

    if (error) {
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
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-lg text-red-500">Error: {error}</p>
                </div>
            </main>
        );
    }

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
            {/* Page Header */}
            <section className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Browse All Sets</h2>

                <button
                    type="button"
                    onClick={() => router.push("/sets")}
                    className="
            group
            text-sm font-medium
            flex items-center gap-2
            px-3 py-1.5
            rounded-md
            border border-[#42c99c] dark:border-[#82664e]
            text-[#193f44] dark:text-[#e8d5b8]
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-all duration-200 ease-out
            hover:translate-x-0.5
            focus:outline-none
            focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
            cursor-pointer
          "
                >
                    Back to My Sets
                    <ArrowRightIcon
                        className="
              w-4 h-4
              transition-transform duration-200
              group-hover:translate-x-1
            "
                    />
                </button>
            </section>

            {/* Filters */}
            <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm opacity-70">
                    Showing {filteredSets.length > 0 ? startIndex + 1 : 0}-
                    {Math.min(endIndex, filteredSets.length)} of {filteredSets.length} set
                    {filteredSets.length === 1 ? "" : "s"}
                </p>

                <div className="flex flex-wrap gap-3">
                    {/* Show */}
                    <label className="text-sm opacity-80 flex items-center gap-2">
                        Show
                        <select
                            value={showFilter}
                            onChange={(e) => setShowFilter(e.target.value as ShowFilter)}
                            className="
                rounded-md px-2 py-1 text-sm
                bg-black/5 dark:bg-white/5
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
                    </label>

                    {/* Sort */}
                    <label className="text-sm opacity-80 flex items-center gap-2">
                        Sort
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                            className="
                rounded-md px-2 py-1 text-sm
                bg-black/5 dark:bg-white/5
                border border-[#42c99c] dark:border-[#82664e]
                focus:outline-none
                focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
              "
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="az">A–Z</option>
                            <option value="za">Z–A</option>
                            <option value="mostOwned">Most Owned</option>
                        </select>
                    </label>
                </div>
            </section>

            {/* Pagination Controls - Top */}
            {totalPages > 1 && (
                <section className="mb-6 flex items-center justify-end gap-2">
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
                {paginatedSets.map((set) => (
                    <SetCard
                        key={set.id}
                        id={set.id}
                        name={set.name}
                        game="Magic the Gathering"
                        imageSrc={set.icon_svg_uri || "/images/DeckHaven-Shield.png"}
                        description={set.set_type || ""}
                        ownedCount={0}
                        totalCount={set.card_count || 0}
                        releaseDate={formatDate(set.released_at)}
                        isFavorited={favorites.has(set.id)}
                        onToggleFavorite={() => toggleFavorite(set.id)}
                        href={`/sets/${set.code}`}
                    />
                ))}
            </section>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
                <section className="mt-6 flex items-center justify-end gap-2">
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
