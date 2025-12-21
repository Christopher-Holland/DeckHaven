"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, XIcon } from "lucide-react";
import CardsCard from "./CardsCard";

type CardItem = {
    id: string;
    name: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
};

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
type KeywordFilter = "all" | string;

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
    // Keyword options (only for MTG)
    const keywordOptions: { value: KeywordFilter; label: string }[] = [
        { value: "all", label: "All" },

        // Evergreen combat / abilities
        { value: "flying", label: "Flying" },
        { value: "trample", label: "Trample" },
        { value: "haste", label: "Haste" },
        { value: "lifelink", label: "Lifelink" },
        { value: "deathtouch", label: "Deathtouch" },
        { value: "vigilance", label: "Vigilance" },
        { value: "first-strike", label: "First Strike" },
        { value: "double-strike", label: "Double Strike" },
        { value: "menace", label: "Menace" },
        { value: "reach", label: "Reach" },

        // Protection / survivability
        { value: "hexproof", label: "Hexproof" },
        { value: "ward", label: "Ward" },
        { value: "indestructible", label: "Indestructible" },
        { value: "protection", label: "Protection" },

        // Casting / timing
        { value: "flash", label: "Flash" },
        { value: "cycling", label: "Cycling" },
        { value: "kicker", label: "Kicker" },
        { value: "flashback", label: "Flashback" },
        { value: "foretell", label: "Foretell" },
        { value: "suspend", label: "Suspend" },

        // Spell mechanics
        { value: "prowess", label: "Prowess" },
        { value: "cascade", label: "Cascade" },
        { value: "convoke", label: "Convoke" },
        { value: "delve", label: "Delve" },
        { value: "storm", label: "Storm" },
        { value: "overload", label: "Overload" },

        // Graveyard / recursion
        { value: "undying", label: "Undying" },
        { value: "persist", label: "Persist" },
        { value: "escape", label: "Escape" },
        { value: "unearth", label: "Unearth" },
        { value: "dredge", label: "Dredge" },

        // Board / synergy mechanics
        { value: "landfall", label: "Landfall" },
        { value: "exploit", label: "Exploit" },
        { value: "populate", label: "Populate" },
        { value: "proliferate", label: "Proliferate" },
        { value: "mentor", label: "Mentor" },

        // Transform / modal
        { value: "transform", label: "Transform" },
        { value: "daybound", label: "Daybound / Nightbound" },
        { value: "modal-dfc", label: "Modal DFC" },
    ];

    // If you switch games, keep the UI consistent by resetting game-specific filters
    useEffect(() => {
        setRarity("all");
        setType("all");
        setManaColor("all");
        setKeyword("all");
    }, [gameParam]);

    // Demo card data (placeholder until API is connected)
    const demoCards: CardItem[] = [
        {
            id: "card-1",
            name: "Demo Card 1",
            imageSrc: "/images/DeckHaven-Shield.png",
            description: "This is a demo card",
            ownedCount: 2,
        },
        {
            id: "card-2",
            name: "Demo Card 2",
            imageSrc: "/images/DeckHaven-Shield.png",
            description: "This is another demo card",
            ownedCount: 0,
        },
        {
            id: "card-3",
            name: "Demo Card 3",
            imageSrc: "/images/DeckHaven-Shield.png",
            description: "Yet another demo card",
            ownedCount: 1,
        },
    ];

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
            // az
            return a.name.localeCompare(b.name);
        });

        return items;
    }, [showFilter, sortBy, rarity, type, manaColor, keyword, favorites]);

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
                                    {manaColorOptions.map((o) => (
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
                                        {keywordOptions.find((o) => o.value === keyword)?.label || "All"}
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
                                        {keywordOptions.map((o) => (
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
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {filteredItems.map((item) => (
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
        </main>
    );
}