"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Search, Plus } from "lucide-react";
import type { ScryfallCard } from "@/app/lib/scryfall";

type CollectionItem = {
    id: string;
    cardId: string; // Scryfall ID
    quantity: number;
    isFoil: boolean;
    condition?: string | null;
    language?: string | null;
};

type CollectionData = {
    items: CollectionItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
};

type Props = {
    open: boolean;
    binderId: string;
    binderGame: string; // "mtg" right now
    cardsPerPage: number;
    pendingSlotNumber?: number | null; // Global slot number (0-based)
    onClose: () => void;
    onAdded?: () => void;
};

export default function AddToBinderModal({
    open,
    binderId,
    binderGame,
    cardsPerPage,
    pendingSlotNumber = null,
    onClose,
    onAdded,
}: Props) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchMode, setSearchMode] = useState<"collection" | "scryfall">("scryfall");

    const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
    const [scryfallResults, setScryfallResults] = useState<ScryfallCard[]>([]);
    const [cardDetails, setCardDetails] = useState<Map<string, ScryfallCard>>(new Map());
    const [collectionCardIds, setCollectionCardIds] = useState<Set<string>>(new Set());

    // Reset when opened/closed
    useEffect(() => {
        if (!open) {
            setQuery("");
            setError(null);
            setAdding(null);
            setCollectionItems([]);
            setScryfallResults([]);
            setCardDetails(new Map());
            setCollectionCardIds(new Set());
            setSearchMode("scryfall");
            return;
        }
    }, [open]);

    // Load user's collection to check ownership status
    useEffect(() => {
        if (!open) return;

        async function loadCollection() {
            try {
                const res = await fetch(`/api/collection?page=1&limit=1000`);
                if (res.ok) {
                    const data: CollectionData = await res.json();
                    setCollectionItems(data.items);
                    setCollectionCardIds(new Set(data.items.map(item => item.cardId)));
                }
            } catch (e) {
                // Failed to load collection
            }
        }

        loadCollection();
    }, [open]);

    // Search Scryfall when query changes (debounced)
    useEffect(() => {
        if (!open) return;
        
        const timeoutId = setTimeout(async () => {
            const q = query.trim();
            if (q.length < 2) {
                setScryfallResults([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // For now, only MTG works - but we'll allow any game value and search MTG anyway
                // This allows users to add MTG cards to any binder
                const normalizedGame = (binderGame || "all").toLowerCase().trim();
                
                // Only block if it's explicitly a non-MTG game (pokemon, yugioh)
                if (normalizedGame === "pokemon" || normalizedGame === "yugioh") {
                    setError("Adding cards is only available for MTG right now.");
                    setLoading(false);
                    return;
                }
                
                // For MTG, all, null, or empty - proceed with MTG search

                const searchUrl = `/api/scryfall/search?q=${encodeURIComponent(q)}`;
                const res = await fetch(searchUrl);
                
                if (!res.ok) {
                    const errorText = await res.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch {
                        errorData = { error: errorText || "Failed to search cards" };
                    }
                    throw new Error(errorData.error || `Search failed with status ${res.status}`);
                }

                const data = await res.json();
                
                // Check if response has error
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Scryfall returns { object: "list", data: [...] }
                const cards: ScryfallCard[] = data.data || [];
                setScryfallResults(cards.slice(0, 50)); // Limit to 50 results

                // Store card details
                const details = new Map<string, ScryfallCard>();
                cards.forEach(card => details.set(card.id, card));
                setCardDetails(prev => new Map([...prev, ...details]));
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to search cards");
                setScryfallResults([]);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [query, open, binderGame]);

    async function handleAdd(cardId: string) {
        try {
            setAdding(cardId);
            setError(null);

            const body = {
                cardId: cardId,
                slotNumber: pendingSlotNumber,
            };

            const res = await fetch(`/api/binders/${binderId}/cards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to add card to binder" }));
                throw new Error(errorData.error || "Failed to add card to binder");
            }

            // Note: Cards are NOT automatically added to collection when added to binder
            // User must manually add cards to collection from the collection page

            await onAdded?.();
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add card");
        } finally {
            setAdding(null);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60" onMouseDown={onClose} />

            <div
                className="
          relative w-[min(900px,96vw)] max-h-[85vh] overflow-hidden
          rounded-2xl
          border border-[var(--theme-border)]
          bg-[var(--theme-bg)]
          text-[var(--theme-fg)]
          shadow-2xl
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 border-b border-[var(--theme-border)]">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">Add a card to binder</h3>
                        {pendingSlotNumber !== null && (
                            <p className="text-sm opacity-70 truncate">
                                Adding to slot {pendingSlotNumber + 1}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
              p-2 rounded-md bg-[var(--theme-sidebar)]
              hover:opacity-90 border border-[var(--theme-border)] transition-colors
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
            "
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search Scryfall for cards (e.g., Lightning Bolt, set:MH2)…"
                                className="
                  w-full rounded-md pl-9 pr-3 py-2 text-sm
                  bg-[var(--theme-sidebar)]
                  border border-[var(--theme-border)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                "
                            />
                        </div>
                    </div>

                    {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
                </div>

                {/* Results */}
                <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
                    {loading && (
                        <div className="py-10 text-center text-sm opacity-70">Searching cards…</div>
                    )}
                    {!loading && query.trim().length < 2 && (
                        <div className="py-10 text-center text-sm opacity-70">Type at least 2 characters to search…</div>
                    )}
                    {!loading && query.trim().length >= 2 && error && (
                        <div className="py-10 text-center">
                            <p className="text-sm text-red-500 mb-2">{error}</p>
                            <p className="text-xs opacity-70">Try a different search term</p>
                        </div>
                    )}
                    {!loading && query.trim().length >= 2 && !error && scryfallResults.length === 0 && (
                        <div className="py-10 text-center text-sm opacity-70">No matches found. Try a different search term.</div>
                    )}
                    {!loading && query.trim().length >= 2 && !error && scryfallResults.length > 0 && (
                        <div className="space-y-2">
                            {scryfallResults.map((card) => {
                                const img = card?.image_uris?.small || card?.card_faces?.[0]?.image_uris?.small;
                                const name = card?.name || "Unknown card";
                                const setName = card?.set_name || "Unknown set";
                                const isInCollection = collectionCardIds.has(card.id);
                                const collectionItem = collectionItems.find(it => it.cardId === card.id);
                                const quantity = collectionItem?.quantity || 0;

                                return (
                                    <div
                                        key={card.id}
                                        className={`
                                            flex items-center justify-between gap-3
                                            rounded-lg p-3
                                            border border-[var(--theme-border)]
                                            transition-opacity
                                            ${isInCollection 
                                                ? "bg-[var(--theme-sidebar)]" 
                                                : "bg-[var(--theme-sidebar)]/50 opacity-60"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {img ? (
                                                <img 
                                                    src={img} 
                                                    alt={name} 
                                                    className={`w-10 h-10 rounded object-cover ${!isInCollection ? "grayscale" : ""}`} 
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-black/10 dark:bg-white/10" />
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm font-medium truncate ${!isInCollection ? "opacity-70" : ""}`}>
                                                    {name}
                                                </p>
                                                <p className={`text-xs truncate ${!isInCollection ? "opacity-50" : "opacity-70"}`}>
                                                    {setName}
                                                </p>
                                                {isInCollection ? (
                                                    <p className="text-xs opacity-70">
                                                        Owned: <span className="font-semibold">{quantity}</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-xs opacity-50 italic">Not in collection</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleAdd(card.id)}
                                            disabled={adding === card.id}
                                            className="
                                                inline-flex items-center gap-2
                                                px-3 py-2 rounded-md text-sm font-medium
                                                bg-[var(--theme-sidebar)]
                                                hover:bg-[var(--theme-accent)]/20
                                                border border-[var(--theme-border)]
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-colors
                                                flex-shrink-0
                                            "
                                        >
                                            <Plus className="w-4 h-4" />
                                            {adding === card.id ? "Adding…" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}