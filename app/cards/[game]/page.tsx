"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";

const GAME_LABELS: Record<string, string> = {
    mtg: "Magic: The Gathering",
    ptcg: "Pokémon",
    ytcg: "Yu-Gi-Oh!",
};

type PageProps = {
    params: Promise<{ game: string }>;
};

type ShowFilter = "all" | "owned" | "favorited";
type SortBy = "az" | "za" | "newest" | "oldest" | "mostOwned";

// Make these flexible across games
type RarityFilter = "all" | string;
type TypeFilter = "all" | string;
type ManaColorFilter = "all" | "white" | "blue" | "black" | "red" | "green" | "colorless" | "multicolor";

const RARITY_OPTIONS: Record<string, { value: string; label: string }[]> = {
    mtg: [
        { value: "all", label: "All" },
        { value: "common", label: "Common" },
        { value: "uncommon", label: "Uncommon" },
        { value: "rare", label: "Rare" },
        { value: "mythic", label: "Mythic Rare" },
        { value: "special", label: "Special" }, // bonus / flexible bucket
    ],
    ptcg: [
        { value: "all", label: "All" },
        { value: "common", label: "Common" },
        { value: "uncommon", label: "Uncommon" },
        { value: "rare", label: "Rare" },
        { value: "double_rare", label: "Double Rare" },
        { value: "ultra_rare", label: "Ultra Rare" },
        { value: "illustration_rare", label: "Illustration Rare" },
        { value: "special_illustration_rare", label: "Special Illustration Rare" },
        { value: "hyper_rare", label: "Hyper Rare" },
        { value: "promo", label: "Promo" },
    ],
    ytcg: [
        { value: "all", label: "All" },
        { value: "common", label: "Common" },
        { value: "rare", label: "Rare" },
        { value: "super_rare", label: "Super Rare" },
        { value: "ultra_rare", label: "Ultra Rare" },
        { value: "secret_rare", label: "Secret Rare" },
        { value: "ultimate_rare", label: "Ultimate Rare" },
        { value: "ghost_rare", label: "Ghost Rare" },
        { value: "starlight_rare", label: "Starlight Rare" },
    ],
};

const TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
    mtg: [
        { value: "all", label: "All" },
        { value: "creature", label: "Creature" },
        { value: "instant", label: "Instant" },
        { value: "sorcery", label: "Sorcery" },
        { value: "artifact", label: "Artifact" },
        { value: "enchantment", label: "Enchantment" },
        { value: "planeswalker", label: "Planeswalker" },
        { value: "land", label: "Land" },
        { value: "battle", label: "Battle" },
    ],
    ptcg: [
        { value: "all", label: "All" },
        { value: "pokemon", label: "Pokémon" },
        { value: "trainer", label: "Trainer" },
        { value: "item", label: "Item" },
        { value: "supporter", label: "Supporter" },
        { value: "stadium", label: "Stadium" },
        { value: "tool", label: "Pokémon Tool" },
        { value: "energy", label: "Energy" },
        { value: "special_energy", label: "Special Energy" },
    ],
    ytcg: [
        { value: "all", label: "All" },
        { value: "monster", label: "Monster" },
        { value: "spell", label: "Spell" },
        { value: "trap", label: "Trap" },
        { value: "fusion", label: "Fusion" },
        { value: "synchro", label: "Synchro" },
        { value: "xyz", label: "Xyz" },
        { value: "link", label: "Link" },
        { value: "ritual", label: "Ritual" },
    ],
};


export default function GamePage({ params }: PageProps) {
    const [gameParam, setGameParam] = useState<string | null>(null);
    const gameName = gameParam ? (GAME_LABELS[gameParam] ?? gameParam.toUpperCase()) : "";

    useEffect(() => {
        params.then((p) => setGameParam(p.game));
    }, [params]);

    // Favorites per-card id (placeholder for future)
    const [favorites] = useState<Set<string>>(() => new Set());

    // ----- Filters -----
    const [showFilter, setShowFilter] = useState<ShowFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("newest");
    const [rarity, setRarity] = useState<RarityFilter>("all");
    const [type, setType] = useState<TypeFilter>("all");
    const [manaColor, setManaColor] = useState<ManaColorFilter>("all");

    // Options depend on game
    const rarityOptions = useMemo(() => {
        if (!gameParam) return [{ value: "all", label: "All" }];
        return RARITY_OPTIONS[gameParam] ?? [{ value: "all", label: "All" }];
    }, [gameParam]);

    const typeOptions = useMemo(() => {
        if (!gameParam) return [{ value: "all", label: "All" }];
        return TYPE_OPTIONS[gameParam] ?? [{ value: "all", label: "All" }];
    }, [gameParam]);

    // Mana color options (only for MTG)
    const manaColorOptions: { value: ManaColorFilter; label: string }[] = [
        { value: "all", label: "All" },
        { value: "white", label: "White" },
        { value: "blue", label: "Blue" },
        { value: "black", label: "Black" },
        { value: "red", label: "Red" },
        { value: "green", label: "Green" },
        { value: "colorless", label: "Colorless" },
        { value: "multicolor", label: "Multicolor" },
    ];

    // If you switch games, keep the UI consistent by resetting game-specific filters
    useEffect(() => {
        setRarity("all");
        setType("all");
        setManaColor("all");
    }, [gameParam]);

    // Placeholder filtered items (no data yet)
    const filteredItems = useMemo(() => {
        return [];
    }, [showFilter, sortBy, rarity, type, manaColor, favorites]);

    const clearFilters = () => {
        setShowFilter("all");
        setSortBy("newest");
        setRarity("all");
        setType("all");
        setManaColor("all");
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
            <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm opacity-70">
                    Showing {filteredItems.length} card{filteredItems.length === 1 ? "" : "s"}
                </p>

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

                    

                    {/* Rarity (game-specific) */}
                    <label className="text-sm opacity-80 flex items-center gap-2">
                        Rarity
                        <select
                            value={rarity}
                            onChange={(e) => setRarity(e.target.value)}
                            className="
                rounded-md px-2 py-1 text-sm
                bg-black/5 dark:bg-white/5
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
                    </label>

                    {/* Type (game-specific) */}
                    <label className="text-sm opacity-80 flex items-center gap-2">
                        Type
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="
                rounded-md px-2 py-1 text-sm
                bg-black/5 dark:bg-white/5
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
                    </label>

                    {/* Mana Color (MTG only) */}
                    {gameParam === "mtg" && (
                        <label className="text-sm opacity-80 flex items-center gap-2">
                            Mana Color
                            <select
                                value={manaColor}
                                onChange={(e) => setManaColor(e.target.value as ManaColorFilter)}
                                className="
                    rounded-md px-2 py-1 text-sm
                    bg-black/5 dark:bg-white/5
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none
                    focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                  "
                            >
                                {manaColorOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

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

            <section
                className="
          rounded-lg
          border border-dashed border-[#42c99c] dark:border-[#82664e]
          p-6
          text-center
          opacity-80
        "
            >
                <p className="font-medium">No card database connected yet</p>
                <p className="text-sm opacity-70 mt-2">
                    Later this page will support browsing, filtering, and viewing card details.
                    For now, this is a structural placeholder.
                </p>
            </section>
        </main>
    );
}