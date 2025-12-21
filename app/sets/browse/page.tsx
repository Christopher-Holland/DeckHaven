"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, XIcon } from "lucide-react";
import SetCard from "./browseCard";

type DemoSet = {
    id: string;
    name: string;
    game: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
    totalCount: number;
    releaseDate: string; // keep as-is for now; can switch to ISO later
};

const demoSets: DemoSet[] = [
    {
        id: "set-11",
        name: "Set 1 Name",
        game: "Pokemon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 1 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-22",
        name: "Set 2 Name",
        game: "Pokemon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 2 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-33",
        name: "Set 3 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 3 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-44",
        name: "Set 4 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 4 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-55",
        name: "Set 5 Name",
        game: "Yu-Gi-Oh!",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 5 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-66",
        name: "Set 6 Name",
        game: "Digimon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 6 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
];

type GameFilter = "all" | string;
type ShowFilter = "all" | "owned" | "favorited";
type SortBy = "az" | "za" | "newest" | "oldest" | "mostOwned";

export default function BrowseSets() {
    const router = useRouter();

    // Favorites per-set id
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
    const [gameFilter, setGameFilter] = useState<GameFilter>("all");
    const [showFilter, setShowFilter] = useState<ShowFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("newest");

    // Build game options dynamically from data (future-proof)
    const gameOptions = useMemo(() => {
        const games = Array.from(new Set(demoSets.map((s) => s.game)));
        games.sort((a, b) => a.localeCompare(b));
        return ["all", ...games];
    }, []);

    const filteredSets = useMemo(() => {
        let items = [...demoSets];

        // Game filter
        if (gameFilter !== "all") {
            items = items.filter((s) => s.game === gameFilter);
        }

        // Show filter
        if (showFilter === "owned") {
            items = items.filter((s) => (s.ownedCount ?? 0) > 0);
        } else if (showFilter === "favorited") {
            items = items.filter((s) => favorites.has(s.id));
        }

        // Sort
        items.sort((a, b) => {
            if (sortBy === "mostOwned") return (b.ownedCount ?? 0) - (a.ownedCount ?? 0);
            // az
            return a.name.localeCompare(b.name);
        });

        return items;
    }, [gameFilter, showFilter, sortBy, favorites]);

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
                    Showing {filteredSets.length} set{filteredSets.length === 1 ? "" : "s"}
                </p>

                <div className="flex flex-wrap gap-3">
                    <button 
                    className="text-sm opacity-80 flex items-center gap-2 px-3 py-1.5 rounded-md text-[#193f44] dark:text-[#e8d5b8] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] cursor-pointer"
                    onClick={() => {
                        setGameFilter("all");
                        setShowFilter("all");
                        setSortBy("az");
                    }}
                    >
                        Clear Filters
                        <XIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                    {/* Game */}
                    <label className="text-sm opacity-80 flex items-center gap-2">
                        Game
                        <select
                            value={gameFilter}
                            onChange={(e) => setGameFilter(e.target.value)}
                            className="
                rounded-md px-2 py-1 text-sm
                bg-black/5 dark:bg-white/5
                border border-[#42c99c] dark:border-[#82664e]
                focus:outline-none
                focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
              "
                        >
                            {gameOptions.map((g) => (
                                <option key={g} value={g}>
                                    {g === "all" ? "All" : g}
                                </option>
                            ))}
                        </select>
                    </label>

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
                            <option value="az">A–Z</option>
                            <option value="za">Z–A</option>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="mostOwned">Most Owned</option>
                        </select>
                    </label>
                </div>
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {filteredSets.map((s) => (
                    <SetCard
                        key={s.id}
                        id={s.id}
                        name={s.name}
                        game={s.game}
                        imageSrc={s.imageSrc}
                        description={s.description}
                        ownedCount={s.ownedCount}
                        totalCount={s.totalCount}
                        releaseDate={s.releaseDate}
                        isFavorited={favorites.has(s.id)}
                        onToggleFavorite={() => toggleFavorite(s.id)}
                        href={`/sets/${s.id}`}
                    />
                ))}
            </section>
        </main>
    );
}