/**
 * Collection Page
 * 
 * Displays the user's card collection in a table format. Shows card name, set,
 * quantity, tags (binders/decks), and action buttons. Includes pagination (10 cards per page)
 * and fetches card details from Scryfall for display.
 * 
 * @page
 * @route /collection
 */

// TODO: Add filters, sorting, and grouping options

"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import { ChevronLeft, ChevronRight, Minus, Plus, ChevronDown } from "lucide-react";
import Loading from "@/app/components/Loading";
import type { ScryfallCard } from "@/app/lib/scryfall";
import EditCardListModal, { type EditableCard } from "./editCardListModal";
import { useRouter } from "next/navigation";
import { useGameFilter } from "@/app/components/GameFilterContext";
import { useToast } from "@/app/components/ToastContext";

type CollectionItem = {
    id: string;
    cardId: string;
    quantity: number;
    condition?: string | null;
    language?: string | null;
    isFoil: boolean;
    tags?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

type CollectionData = {
    items: CollectionItem[];
    pagination: {
        page: number;
        limit: number;
        total: number; // Unique cards count
        totalQuantity?: number; // Total cards owned (sum of quantities)
        totalPages: number;
    };
};

export default function CollectionPage() {
    const user = useUser();
    const router = useRouter();
    const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
    const [cards, setCards] = useState<Map<string, ScryfallCard>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [editCardListModalOpen, setEditCardListModalOpen] = useState(false);
    const [editCardList, setEditCardList] = useState<CollectionItem | null>(null);
    const [updatingQuantities, setUpdatingQuantities] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "newest" | "oldest" | "quantity">("newest");
    const [selectedSet, setSelectedSet] = useState<string>("all");
    const [selectedTag, setSelectedTag] = useState<string>("all");
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const { game } = useGameFilter();
    const { showToast } = useToast();

    const isSearchMode = debouncedSearchQuery.trim().length > 0;

    // Debounce search query (300ms) to avoid refetching on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when game filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [game, debouncedSearchQuery]);

    // Fetch collection data
    useEffect(() => {
        if (!user) return;

        async function fetchCollection() {
            try {
                setLoading(true);
                setError(null);

                const gameParam = game === "all" ? "" : `&game=${game}`;
                const isSearching = debouncedSearchQuery.trim().length > 0;
                const page = isSearching ? 1 : currentPage;
                const limit = isSearching ? 10000 : itemsPerPage;

                const response = await fetch(`/api/collection?page=${page}&limit=${limit}${gameParam}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch collection");
                }

                const data: CollectionData = await response.json();

                // Fetch card details: batch when full collection, per-card when paginated
                const cardsMap = new Map<string, ScryfallCard>();
                if (data.items.length > 0) {
                    if (isSearching && data.items.length > 0) {
                        const ids = [...new Set(data.items.map((i) => i.cardId))];
                        try {
                            const batchRes = await fetch("/api/scryfall/cards/batch", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ ids }),
                            });
                            if (batchRes.ok) {
                                const { cards: batchCards } = await batchRes.json();
                                Object.entries(batchCards).forEach(([id, card]) => {
                                    cardsMap.set(id, card as ScryfallCard);
                                });
                            }
                        } catch {
                            // Fallback to per-card if batch fails
                        }
                    }
                    for (const item of data.items) {
                        if (cardsMap.has(item.cardId)) continue;
                        try {
                            const cardResponse = await fetch(`/api/scryfall/card/${item.cardId}`);
                            if (cardResponse.ok) {
                                const cardData = await cardResponse.json();
                                cardsMap.set(item.cardId, cardData);
                            }
                        } catch {
                            // Failed to fetch card
                        }
                    }
                }
                setCards(cardsMap);

                let filteredItems = data.items;
                let filteredTotal = data.pagination.total;
                let filteredTotalQuantity = data.pagination.totalQuantity || 0;

                if (game === "pokemon" || game === "yugioh") {
                    filteredItems = [];
                    filteredTotal = 0;
                    filteredTotalQuantity = 0;
                } else if (game === "mtg" || game === "all") {
                    filteredItems = data.items;
                    filteredTotal = data.pagination.total;
                    filteredTotalQuantity = data.pagination.totalQuantity || 0;
                }

                setCollectionData({
                    items: filteredItems,
                    pagination: {
                        ...data.pagination,
                        total: filteredTotal,
                        totalQuantity: filteredTotalQuantity,
                        totalPages: isSearching ? 1 : Math.ceil(filteredTotal / itemsPerPage),
                    },
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load collection");
            } finally {
                setLoading(false);
            }
        }

        fetchCollection();
    }, [user, currentPage, game, debouncedSearchQuery]);

    // Handle quantity update
    const handleQuantityUpdate = async (item: CollectionItem, newQuantity: number) => {
        if (newQuantity < 0) return; // Don't allow negative quantities
        
        setUpdatingQuantities(prev => new Set(prev).add(item.id));
        try {
            const requestBody = {
                cardId: item.cardId,
                quantity: newQuantity,
                condition: item.condition || null,
                language: item.language || null,
                notes: item.notes || null,
                tags: item.tags || null,
                isFoil: item.isFoil ?? false,
            };

            const response = await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to update quantity" }));
                throw new Error(errorData.error || "Failed to update quantity");
            }

            // Refresh collection data (full fetch when search active, else current page)
            const gameParam = game === "all" ? "" : `&game=${game}`;
            const isSearching = debouncedSearchQuery.trim().length > 0;
            const page = isSearching ? 1 : currentPage;
            const limit = isSearching ? 10000 : itemsPerPage;
            const collectionResponse = await fetch(`/api/collection?page=${page}&limit=${limit}${gameParam}`);
            if (collectionResponse.ok) {
                const data: CollectionData = await collectionResponse.json();
                const cardsMap = new Map<string, ScryfallCard>(cards);
                if (isSearching && data.items.length > 0) {
                    const ids = [...new Set(data.items.map((i) => i.cardId))];
                    try {
                        const batchRes = await fetch("/api/scryfall/cards/batch", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids }),
                        });
                        if (batchRes.ok) {
                            const { cards: batchCards } = await batchRes.json();
                            Object.entries(batchCards).forEach(([id, card]) => {
                                cardsMap.set(id, card as ScryfallCard);
                            });
                        }
                    } catch {
                        // Fallback to per-card below
                    }
                }
                for (const newItem of data.items) {
                    if (!cardsMap.has(newItem.cardId)) {
                        try {
                            const cardResponse = await fetch(`/api/scryfall/card/${newItem.cardId}`);
                            if (cardResponse.ok) {
                                const cardData = await cardResponse.json();
                                cardsMap.set(newItem.cardId, cardData);
                            }
                        } catch {
                            // Failed to fetch card
                        }
                    }
                }
                setCards(cardsMap);
                let filteredItems = data.items;
                let filteredTotal = data.pagination.total;
                let filteredTotalQuantity = data.pagination.totalQuantity || 0;
                if (game === "pokemon" || game === "yugioh") {
                    filteredItems = [];
                    filteredTotal = 0;
                    filteredTotalQuantity = 0;
                } else if (game === "mtg" || game === "all") {
                    filteredItems = data.items;
                    filteredTotal = data.pagination.total;
                    filteredTotalQuantity = data.pagination.totalQuantity || 0;
                }
                setCollectionData({
                    items: filteredItems,
                    pagination: {
                        ...data.pagination,
                        total: filteredTotal,
                        totalQuantity: filteredTotalQuantity,
                        totalPages: isSearching ? 1 : Math.ceil(filteredTotal / itemsPerPage),
                    },
                });
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update quantity", "error");
        } finally {
            setUpdatingQuantities(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    // Get all available sets and tags for filtering
    const availableSets = useMemo(() => {
        if (!collectionData) return [];
        const sets = new Set<string>();
        collectionData.items.forEach(item => {
            const card = cards.get(item.cardId);
            if (card?.set_name) {
                sets.add(card.set_name);
            }
        });
        return Array.from(sets).sort();
    }, [collectionData, cards]);

    const availableTags = useMemo(() => {
        if (!collectionData) return [];
        const tags = new Set<string>();
        collectionData.items.forEach(item => {
            if (item.isFoil) tags.add("Foil");
            if (item.condition) tags.add(item.condition);
            if (item.language && item.language !== "en") tags.add(item.language.toUpperCase());
            if (item.tags) {
                const customTags = item.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                customTags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }, [collectionData]);

    // Filter and sort items
    const filteredAndSortedItems = useMemo(() => {
        if (!collectionData) return [];
        
        let items = [...collectionData.items];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            items = items.filter(item => {
                const card = cards.get(item.cardId);
                const cardName = card?.name?.toLowerCase() || "";
                return cardName.includes(query);
            });
        }

        // Apply set filter
        if (selectedSet !== "all") {
            items = items.filter(item => {
                const card = cards.get(item.cardId);
                return card?.set_name === selectedSet;
            });
        }

        // Apply tag filter
        if (selectedTag !== "all") {
            items = items.filter(item => {
                const tags: string[] = [];
                if (item.isFoil) tags.push("Foil");
                if (item.condition) tags.push(item.condition);
                if (item.language && item.language !== "en") tags.push(item.language.toUpperCase());
                if (item.tags) {
                    const customTags = item.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                    tags.push(...customTags);
                }
                return tags.includes(selectedTag);
            });
        }

        // Apply sorting
        items.sort((a, b) => {
            const cardA = cards.get(a.cardId);
            const cardB = cards.get(b.cardId);
            
            switch (sortBy) {
                case "name-asc":
                    const nameA = cardA?.name?.toLowerCase() || "";
                    const nameB = cardB?.name?.toLowerCase() || "";
                    return nameA.localeCompare(nameB);
                case "name-desc":
                    const nameA2 = cardA?.name?.toLowerCase() || "";
                    const nameB2 = cardB?.name?.toLowerCase() || "";
                    return nameB2.localeCompare(nameA2);
                case "newest":
                    return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
                case "oldest":
                    return new Date(a.updatedAt || a.createdAt || 0).getTime() - new Date(b.updatedAt || b.createdAt || 0).getTime();
                case "quantity":
                    return b.quantity - a.quantity;
                default:
                    return 0;
            }
        });

        return items;
    }, [collectionData, cards, searchQuery, selectedSet, selectedTag, sortBy]);

    // When search is active, paginate filtered results client-side
    const paginatedDisplayItems = useMemo(() => {
        if (!isSearchMode) return filteredAndSortedItems;
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedItems.slice(start, start + itemsPerPage);
    }, [isSearchMode, filteredAndSortedItems, currentPage, itemsPerPage]);

    const displayTotal = isSearchMode ? filteredAndSortedItems.length : (collectionData?.pagination.total ?? 0);
    const displayTotalPages = isSearchMode
        ? Math.ceil(filteredAndSortedItems.length / itemsPerPage)
        : (collectionData?.pagination.totalPages ?? 1);

    // Calculate stats by game
    // Note: Stats are based on the total collection, not just the current page
    // Since all cards currently come from Scryfall (MTG), all cards are MTG
    // Use totalQuantity (sum of all quantities) instead of total (unique cards count)
    const totalCards = collectionData?.pagination.totalQuantity || collectionData?.pagination.total || 0;
    const mtgCount = totalCards; // All Scryfall cards are MTG
    const pokemonCount = 0; // Not implemented yet - would need Pokemon API
    const yugiohCount = 0; // Not implemented yet - would need YuGiOh API

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
            {/* Header */}
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Collection</h2>
                    <p className="text-sm opacity-70 mt-1">Inventory-first view of everything you own.</p>
                </div>
            </section>

            {/* Summary + Actions */}
            <section className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Stat tile */}
                <div
                    className="
                        rounded-lg p-4
                        text-center
                        border border-[var(--theme-border)]
                        bg-[var(--theme-sidebar)]
                        lg:col-span-1
                        "
                >
                    <p className="text-xs opacity-70">
                        {game === "all"
                            ? "Total Cards Owned"
                            : `Cards Owned (${game.toUpperCase()})`}
                    </p>
                    <p className="text-2xl font-semibold mt-1">{totalCards}</p>
                    
                </div>

                {/* Action strip */}
                <div
                    className="
                        rounded-lg p-4
                        border border-[var(--theme-border)]
                        bg-[var(--theme-sidebar)]
                        lg:col-span-2
                        "
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm opacity-70 text-center">Quick Actions</p>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => router.push("/collection/binders")}
                            className="
          w-full px-3 py-2 rounded-md text-sm font-medium
          bg-black/5 dark:bg-white/5
          border border-[var(--theme-border)]
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors
          focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
        "
                        >
                            Open Binders
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/sets")} // change if your add-flow lives elsewhere
                            className="
          w-full px-3 py-2 rounded-md text-sm font-medium
          bg-black/5 dark:bg-white/5
          border border-[var(--theme-border)]
          hover:bg-black/10 dark:hover:bg-white/10
          transition-colors
          focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
        "
                        >
                            Add Cards
                        </button>

                        <button
                            type="button"
                            disabled
                            title="Coming soon"
                            className="
          w-full px-3 py-2 rounded-md text-sm font-medium
          bg-black/5 dark:bg-white/5
          border border-[var(--theme-border)]
          opacity-60 cursor-not-allowed
        "
                        >
                            Import CSV
                        </button>
                    </div>
                </div>
            </section>

            {/* Controls bar */}
            <section
                className="
          mb-4 rounded-lg p-3
          border border-[var(--theme-border)]
          bg-black/5 dark:bg-white/5
          flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between
        "
            >
                <input
                    type="text"
                    placeholder="Search your collection…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
            w-full lg:max-w-sm
            rounded-md px-3 py-2 text-sm
            bg-[var(--theme-sidebar)]
            border border-[var(--theme-border)]
            focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
          "
                />

                <div className="flex flex-wrap items-center gap-2 relative">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                            className="
                  px-3 py-1.5 rounded-md text-sm font-medium
                  bg-[var(--theme-sidebar)]
                  border border-[var(--theme-border)]
                  hover:bg-black/10 dark:hover:bg-white/10
                  transition-colors
                  flex items-center gap-1
                "
                        >
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} />
                        </button>
                        
                        {filterMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setFilterMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 z-20 w-56 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-sidebar)] shadow-lg p-3 space-y-3">
                                    {/* Sort Options */}
                                    <div>
                                        <label className="text-xs font-semibold opacity-80 mb-2 block">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                            className="
                                    w-full rounded-md px-2 py-1.5 text-sm
                                    bg-[var(--theme-bg)]
                                    border border-[var(--theme-border)]
                                    focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
                                  "
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                            <option value="name-asc">A-Z</option>
                                            <option value="name-desc">Z-A</option>
                                            <option value="quantity">Quantity</option>
                                        </select>
                                    </div>

                                    {/* Set Filter */}
                                    <div>
                                        <label className="text-xs font-semibold opacity-80 mb-2 block">Set</label>
                                        <select
                                            value={selectedSet}
                                            onChange={(e) => setSelectedSet(e.target.value)}
                                            className="
                                    w-full rounded-md px-2 py-1.5 text-sm
                                    bg-[var(--theme-bg)]
                                    border border-[var(--theme-border)]
                                    focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
                                  "
                                        >
                                            <option value="all">All Sets</option>
                                            {availableSets.map(set => (
                                                <option key={set} value={set}>{set}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tag Filter */}
                                    <div>
                                        <label className="text-xs font-semibold opacity-80 mb-2 block">Tag</label>
                                        <select
                                            value={selectedTag}
                                            onChange={(e) => setSelectedTag(e.target.value)}
                                            className="
                                    w-full rounded-md px-2 py-1.5 text-sm
                                    bg-[var(--theme-bg)]
                                    border border-[var(--theme-border)]
                                    focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
                                  "
                                        >
                                            <option value="all">All Tags</option>
                                            {availableTags.map(tag => (
                                                <option key={tag} value={tag}>{tag}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSortBy("newest");
                                                setSelectedSet("all");
                                                setSelectedTag("all");
                                            }}
                                            className="
                                            w-full rounded-md px-2 py-1.5 text-sm
                                            bg-[var(--theme-bg)]
                                            border border-[var(--theme-border)]
                                            hover:bg-black/10 dark:hover:bg-white/10
                                            focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
                                            transition-colors
                                            ">
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Inventory list */}
            <section
                className="
          rounded-lg overflow-hidden
          border border-[var(--theme-border)]
          bg-[var(--theme-sidebar)]
        "
            >
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold opacity-80 border-b border-black/10 dark:border-white/10">
                    <div className="col-span-5">Card</div>
                    <div className="col-span-2">Set</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2">Tags</div>
                    <div className="col-span-2 text-right">Quantity</div>
                </div>

                {/* Collection rows */}
                {paginatedDisplayItems.length > 0 ? (
                    paginatedDisplayItems.map((item) => {
                        const card = cards.get(item.cardId);
                        const cardImage = card?.image_uris?.small || card?.image_uris?.normal || card?.card_faces?.[0]?.image_uris?.small;
                        const cardName = card?.name || "Loading...";
                        const setName = card?.set_name || "Unknown Set";
                        const tags: string[] = [];
                        // Build tags from card metadata
                        if (item.isFoil) tags.push("Foil");
                        if (item.condition) tags.push(item.condition);
                        if (item.language && item.language !== "en") tags.push(item.language.toUpperCase());
                        // Add custom tags from database if they exist
                        if (item.tags) {
                            const customTags = item.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                            tags.push(...customTags);
                        }

                        return (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setEditCardListModalOpen(true);
                                    setEditCardList(item);
                                }}
                                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="col-span-5 flex items-center gap-3">
                                    {cardImage ? (
                                        <img
                                            src={cardImage}
                                            alt={cardName}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-black/10 dark:bg-white/10" />
                                    )}
                                    <div>
                                        <p className="font-medium leading-tight">{cardName}</p>
                                        <p className="text-xs opacity-70">
                                            {/* Determine game from card source - all Scryfall cards are MTG */}
                                            MTG
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-xs opacity-80">{setName}</div>
                                <div className="col-span-1 text-center font-semibold">{item.quantity}</div>
                                <div className="col-span-2 text-xs opacity-80">
                                    {tags.length > 0 ? tags.join(" • ") : "—"}
                                </div>
                                <div 
                                    className="col-span-2 flex justify-end items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-1 border border-[var(--theme-border)] rounded-md bg-[var(--theme-sidebar)]">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuantityUpdate(item, item.quantity - 1);
                                            }}
                                            disabled={updatingQuantities.has(item.id) || item.quantity <= 0}
                                            className="
                                                p-1 rounded-l-md
                                                hover:bg-black/10 dark:hover:bg-white/10
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-colors
                                                focus:outline-none
                                            "
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="px-2 text-xs font-semibold min-w-[2ch] text-center">
                                            {updatingQuantities.has(item.id) ? "..." : item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuantityUpdate(item, item.quantity + 1);
                                            }}
                                            disabled={updatingQuantities.has(item.id)}
                                            className="
                                                p-1 rounded-r-md
                                                hover:bg-black/10 dark:hover:bg-white/10
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-colors
                                                focus:outline-none
                                            "
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="px-4 py-8 text-center text-sm opacity-70">
                        {searchQuery || selectedSet !== "all" || selectedTag !== "all"
                            ? "No cards match your filters. Try adjusting your search or filters."
                            : "No cards in your collection yet. Start adding cards from sets!"
                        }
                    </div>
                )}
            </section>

            {/* Pagination */}
            {collectionData && displayTotalPages > 1 && (
                <section className="mt-6 flex items-center justify-between">
                    <p className="text-sm opacity-70">
                        Showing {paginatedDisplayItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                        {Math.min(currentPage * itemsPerPage, displayTotal)} of {displayTotal} cards
                    </p>
                    <div className="flex items-center gap-2">
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
                            focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
                            flex items-center gap-1
                        "
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    page === 1 ||
                                    page === displayTotalPages ||
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
                                            focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
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
                            onClick={() => setCurrentPage((p) => Math.min(displayTotalPages, p + 1))}
                            disabled={currentPage === displayTotalPages}
                            className="
                            px-3 py-1.5 rounded-md
                            bg-[var(--theme-sidebar)]
                            text-[var(--theme-fg)]
                            border border-[var(--theme-border)]
                            hover:bg-black/10 dark:hover:bg-white/10
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors
                            focus:outline-none           focus:ring-2 focus:ring-[var(--theme-accent)]
                            flex items-center gap-1
                        "
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>
            )}

            {/* Edit Card Modal */}
            <EditCardListModal
                open={editCardListModalOpen}
                card={editCardList ? {
                    id: editCardList.id,
                    cardId: editCardList.cardId,
                    name: cards.get(editCardList.cardId)?.name || "Unknown Card",
                    quantity: editCardList.quantity,
                    condition: editCardList.condition || undefined,
                    language: editCardList.language || undefined,
                    notes: editCardList.notes || undefined,
                    tags: editCardList.tags || undefined,
                    isFoil: editCardList.isFoil,
                } : null}
                onClose={() => {
                    setEditCardListModalOpen(false);
                    setEditCardList(null);
                }}
                onSave={async (updated: EditableCard) => {
                    if (!editCardList) {
                        throw new Error("No card selected");
                    }

                    // Prepare request body - always include all fields
                    const requestBody = {
                        cardId: updated.cardId,
                        quantity: updated.quantity,
                        condition: updated.condition || null,
                        language: updated.language || null,
                        notes: updated.notes || null,
                        tags: updated.tags || null,
                        isFoil: updated.isFoil ?? false,
                    };

                    // Update collection via API
                    const response = await fetch("/api/collection", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody),
                    });

                    if (!response.ok) {
                        let errorMessage = "Failed to save card";
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.error || errorMessage;
                        } catch (e) {
                            errorMessage = `Server error: ${response.status} ${response.statusText}`;
                        }
                        throw new Error(errorMessage);
                    }

                    // Refresh collection data (full fetch when search active)
                    const gameParam = game === "all" ? "" : `&game=${game}`;
                    const isSearching = debouncedSearchQuery.trim().length > 0;
                    const page = isSearching ? 1 : currentPage;
                    const limit = isSearching ? 10000 : itemsPerPage;
                    const collectionResponse = await fetch(`/api/collection?page=${page}&limit=${limit}${gameParam}`);
                    if (!collectionResponse.ok) {
                        throw new Error("Failed to refresh collection data");
                    }

                    const data: CollectionData = await collectionResponse.json();
                    const cardsMap = new Map<string, ScryfallCard>(cards);
                    if (isSearching && data.items.length > 0) {
                        const ids = [...new Set(data.items.map((i) => i.cardId))];
                        try {
                            const batchRes = await fetch("/api/scryfall/cards/batch", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ ids }),
                            });
                            if (batchRes.ok) {
                                const { cards: batchCards } = await batchRes.json();
                                Object.entries(batchCards).forEach(([id, card]) => {
                                    cardsMap.set(id, card as ScryfallCard);
                                });
                            }
                        } catch {
                            // Fallback to per-card below
                        }
                    }
                    for (const item of data.items) {
                        if (cardsMap.has(item.cardId)) continue;
                        try {
                            const cardResponse = await fetch(`/api/scryfall/card/${item.cardId}`);
                            if (cardResponse.ok) {
                                const cardData = await cardResponse.json();
                                cardsMap.set(item.cardId, cardData);
                            }
                        } catch {
                            // Failed to fetch card
                        }
                    }
                    setCards(cardsMap);
                    setCollectionData(data);

                    // Close modal only after successful save and refresh
                    setEditCardListModalOpen(false);
                    setEditCardList(null);
                }}
            />
        </main>
    );
}