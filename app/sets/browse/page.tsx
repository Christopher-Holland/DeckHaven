/**
 * Browse Sets Page
 * 
 * Displays all available sets for a selected game (Magic the Gathering, Pokémon, Yu-Gi-Oh!).
 * Fetches sets from Scryfall API (currently only Magic is supported), groups related sets
 * by parent set code, and provides filtering, sorting, and pagination capabilities.
 * 
 * Users navigate here from the Sets landing page by selecting a game. The page shows
 * 25 sets per page, sorted by release date (newest first by default), with options to
 * filter by ownership/favorites and sort by various criteria.
 * 
 * @page
 * @route /sets/browse?game={gameId}
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon, ChevronLeft, ChevronRight } from "lucide-react";
import SetCard from "./browseCard";
import Loading from "@/app/components/Loading";

type ScryfallSet = {
    id: string;
    code: string;
    name: string;
    released_at?: string;
    set_type?: string;
    icon_svg_uri?: string;
    card_count?: number;
    parent_set_code?: string; // Code of the parent set if this is a child set
};

type GroupedSet = {
    parentCode: string;
    parentSet: ScryfallSet;
    childSets: ScryfallSet[];
    totalCardCount: number;
    earliestReleaseDate?: string;
};

type GameFilter = "all" | string;
type ShowFilter = "all" | "owned" | "favorited";
type SortBy = "az" | "za" | "newest" | "oldest" | "mostOwned";

const GAME_LABELS: Record<string, string> = {
    mtg: "Magic the Gathering",
    ptcg: "Pokémon",
    ytcg: "Yu-Gi-Oh!",
};

export default function BrowseSets() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedGame = searchParams.get("game") || "mtg"; // Default to Magic

    // State
    const [sets, setSets] = useState<ScryfallSet[]>([]);
    const [groupedSets, setGroupedSets] = useState<GroupedSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const setsPerPage = 25;

    // Filters
    const [gameFilter, setGameFilter] = useState<GameFilter>("all");
    const [showFilter, setShowFilter] = useState<ShowFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("newest");

    // Fetch sets based on selected game
    useEffect(() => {
        async function fetchSets() {
            // Only Magic the Gathering is currently supported via Scryfall
            if (selectedGame !== "mtg") {
                setLoading(false);
                setSets([]);
                setGroupedSets([]);
                return;
            }

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

                // Group sets by parent
                const grouped = groupSetsByParent(mtgSets);
                setGroupedSets(grouped);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load sets");
            } finally {
                setLoading(false);
            }
        }

        fetchSets();
        setCurrentPage(1); // Reset to page 1 when game changes
    }, [selectedGame]);

    // Group sets by parent_set_code
    function groupSetsByParent(sets: ScryfallSet[]): GroupedSet[] {
        const parentMap = new Map<string, ScryfallSet>();
        const childMap = new Map<string, ScryfallSet[]>();
        const allSetCodes = new Set(sets.map(s => s.code));

        // First pass: identify parent sets and collect children
        sets.forEach((set) => {
            if (set.parent_set_code && allSetCodes.has(set.parent_set_code)) {
                // This is a child set with a valid parent in our list
                const parentCode = set.parent_set_code;
                if (!childMap.has(parentCode)) {
                    childMap.set(parentCode, []);
                }
                childMap.get(parentCode)!.push(set);
            } else {
                // This is a parent set (or standalone, or child with missing parent)
                parentMap.set(set.code, set);
            }
        });

        // Second pass: create grouped sets
        const grouped: GroupedSet[] = [];

        parentMap.forEach((parentSet, parentCode) => {
            const children = childMap.get(parentCode) || [];

            // Calculate total card count from parent + all children
            const totalCardCount = (parentSet.card_count || 0) +
                children.reduce((sum, child) => sum + (child.card_count || 0), 0);

            // Find earliest release date (parent or earliest child)
            const allDates = [
                parentSet.released_at,
                ...children.map(c => c.released_at)
            ].filter(Boolean) as string[];

            const earliestReleaseDate = allDates.length > 0
                ? allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
                : parentSet.released_at;

            grouped.push({
                parentCode,
                parentSet,
                childSets: children,
                totalCardCount,
                earliestReleaseDate,
            });
        });

        return grouped;
    }

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Filter and sort grouped sets
    const filteredSets = useMemo(() => {
        let items = [...groupedSets];

        // Show filter (for future database integration)
        if (showFilter === "owned") {
            // Will filter by owned sets from database later
            items = items.filter(() => false); // Empty for now
        } else if (showFilter === "favorited") {
            items = items.filter((group) => favorites.has(group.parentSet.id));
        }

        // Sort
        items.sort((a, b) => {
            if (sortBy === "mostOwned") {
                // Will sort by owned count from database later
                return 0;
            }
            if (sortBy === "az") {
                return a.parentSet.name.localeCompare(b.parentSet.name);
            }
            if (sortBy === "za") {
                return b.parentSet.name.localeCompare(a.parentSet.name);
            }
            if (sortBy === "newest") {
                // Sort by release date, most recent first
                const dateA = a.earliestReleaseDate ? new Date(a.earliestReleaseDate).getTime() : 0;
                const dateB = b.earliestReleaseDate ? new Date(b.earliestReleaseDate).getTime() : 0;
                return dateB - dateA; // Descending (newest first)
            }
            if (sortBy === "oldest") {
                // Sort by release date, oldest first
                const dateA = a.earliestReleaseDate ? new Date(a.earliestReleaseDate).getTime() : 0;
                const dateB = b.earliestReleaseDate ? new Date(b.earliestReleaseDate).getTime() : 0;
                return dateA - dateB; // Ascending (oldest first)
            }
            return 0;
        });

        return items;
    }, [groupedSets, showFilter, sortBy, favorites]);

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
        bg-[var(--theme-bg)]
        px-6 py-6
        text-[var(--theme-fg)]
        transition-all duration-300
      "
            >
                <Loading />
            </main>
        );
    }

    if (error) {
        return (
            <main
                className="
        min-h-[calc(100vh-8rem)]
        bg-[var(--theme-bg)]
        px-6 py-6
        text-[var(--theme-fg)]
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
        bg-[var(--theme-bg)]
        px-6 py-6
        text-[var(--theme-fg)]
        transition-all duration-300
      "
        >
            {/* Page Header */}
            <section className="mb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">
                        {GAME_LABELS[selectedGame] || "Browse All Sets"}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                        Browse sets for {GAME_LABELS[selectedGame] || selectedGame}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/sets")}
                    className="
            group
            text-sm font-medium
            flex items-center gap-2
            px-3 py-1.5
            rounded-md
            border border-[var(--theme-border)]
            text-[var(--theme-fg)]
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-all duration-200 ease-out
            hover:translate-x-0.5
            focus:outline-none
            focus:ring-2 focus:ring-[var(--theme-accent)]
            cursor-pointer
          "
                >
                    Back to Sets
                    <ArrowRightIcon
                        className="
              w-4 h-4
              transition-transform duration-200
              group-hover:translate-x-1
            "
                    />
                </button>
            </section>

            {/* Unsupported Game Message */}
            {selectedGame !== "mtg" && !loading && (
                <section className="mb-6">
                    <div
                        className="
                        rounded-lg
                        border border-dashed border-[var(--theme-border)]
                        bg-transparent
                        p-12
                        flex flex-col items-center justify-center
                        text-center
                        opacity-70
                    "
                    >
                        <p className="text-lg font-medium mb-2">
                            {GAME_LABELS[selectedGame]} sets coming soon
                        </p>
                        <p className="text-sm opacity-80 mb-4">
                            API integration for {GAME_LABELS[selectedGame]} is in progress
                        </p>
                        <button
                            type="button"
                            onClick={() => router.push("/sets")}
                            className="
                            text-sm font-medium
                            px-4 py-2 rounded-md
                            bg-[var(--theme-accent)]
                            text-white
                            hover:bg-[var(--theme-accent-hover)]
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                        "
                        >
                            Back to Game Selection
                        </button>
                    </div>
                </section>
            )}

            {/* Filters - Only show for supported games */}
            {selectedGame === "mtg" && (
                <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                border border-[var(--theme-border)]
                focus:outline-none
                focus:ring-2 focus:ring-[var(--theme-accent)]
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
                border border-[var(--theme-border)]
                focus:outline-none
                focus:ring-2 focus:ring-[var(--theme-accent)]
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
            )}

            {/* Pagination Controls - Top - Only show for supported games with sets */}
            {selectedGame === "mtg" && totalPages > 1 && (
                <section className="mb-6 flex items-center justify-end gap-2">
                    <p className="text-sm opacity-70">
                        Showing {filteredSets.length > 0 ? startIndex + 1 : 0}-
                        {Math.min(endIndex, filteredSets.length)} of {filteredSets.length} set
                        {filteredSets.length === 1 ? "" : "s"}
                    </p>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="
              px-3 py-1.5 rounded-md
              bg-[var(--theme-sidebar)]
              text-[var(--theme-fg)]
              border border-[var(--theme-border)]
              hover:bg-black/10 dark:hover:bg-white/10
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
                      focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                      ${currentPage === page
                                                ? "bg-[var(--theme-accent)] text-white font-semibold"
                                                : "bg-[var(--theme-sidebar)] text-[var(--theme-fg)] border border-[var(--theme-border)] hover:bg-black/10 dark:hover:bg-white/10"
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
              bg-[var(--theme-sidebar)]
              text-[var(--theme-fg)]
              border border-[var(--theme-border)]
              hover:bg-black/10 dark:hover:bg-white/10
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
              flex items-center gap-1
            "
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </section>
            )}

            {/* Content Grid - Only show for supported games */}
            {selectedGame === "mtg" && (
                <section className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
                    {paginatedSets.map((group) => (
                    <SetCard
                        key={group.parentSet.id}
                        id={group.parentSet.id}
                        name={group.parentSet.name}
                        game={GAME_LABELS[selectedGame] || "Magic the Gathering"}
                        imageSrc={group.parentSet.icon_svg_uri || "/images/DeckHaven-Shield.png"}
                        description={group.childSets.length > 0
                            ? `${group.parentSet.set_type || ""} (${group.childSets.length + 1} sets)`
                            : group.parentSet.set_type || ""}
                        ownedCount={0}
                        totalCount={group.totalCardCount}
                        releaseDate={formatDate(group.earliestReleaseDate)}
                        isFavorited={favorites.has(group.parentSet.id)}
                        onToggleFavorite={() => toggleFavorite(group.parentSet.id)}
                        href={`/sets/${group.parentCode}`}
                    />
                    ))}
                </section>
            )}

            {/* Pagination Controls - Bottom - Only show for supported games with sets */}
            {selectedGame === "mtg" && totalPages > 1 && (
                <section className="mt-6 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="
              px-3 py-1.5 rounded-md
              bg-[var(--theme-sidebar)]
              text-[var(--theme-fg)]
              border border-[var(--theme-border)]
              hover:bg-black/10 dark:hover:bg-white/10
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
                      focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                      ${currentPage === page
                                                ? "bg-[var(--theme-accent)] text-white font-semibold"
                                                : "bg-[var(--theme-sidebar)] text-[var(--theme-fg)] border border-[var(--theme-border)] hover:bg-black/10 dark:hover:bg-white/10"
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
              bg-[var(--theme-sidebar)]
              text-[var(--theme-fg)]
              border border-[var(--theme-border)]
              hover:bg-black/10 dark:hover:bg-white/10
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
