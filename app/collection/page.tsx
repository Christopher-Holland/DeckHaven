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
// TODO: Add ability to add cards to binders/decks
// TODO: Add ability to delete cards
// TODO: Add ability to export collection as CSV
// TODO: Add ability to import collection from CSV
// TODO: Add ability to export collection as JSON
// TODO: Add ability to import collection from JSON

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "@/app/components/Loading";
import type { ScryfallCard } from "@/app/lib/scryfall";
import EditCardListModal, { type EditableCard } from "./editCardListModal";
import { useRouter } from "next/navigation";

type CollectionItem = {
    id: string;
    cardId: string;
    quantity: number;
    condition?: string | null;
    language?: string | null;
    isFoil: boolean;
    tags?: string | null;
    notes?: string | null;
};

type CollectionData = {
    items: CollectionItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
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

    // Fetch collection data
    useEffect(() => {
        if (!user) return;

        async function fetchCollection() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/collection?page=${currentPage}&limit=${itemsPerPage}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch collection");
                }

                const data: CollectionData = await response.json();
                setCollectionData(data);

                // Fetch card details from Scryfall for each card
                const cardsMap = new Map<string, ScryfallCard>();
                for (const item of data.items) {
                    try {
                        const cardResponse = await fetch(`/api/scryfall/card/${item.cardId}`);
                        if (cardResponse.ok) {
                            const cardData = await cardResponse.json();
                            cardsMap.set(item.cardId, cardData);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch card ${item.cardId}:`, err);
                    }
                }
                setCards(cardsMap);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load collection");
            } finally {
                setLoading(false);
            }
        }

        fetchCollection();
    }, [user, currentPage]);

    // Calculate stats
    const totalCards = collectionData?.pagination.total || 0;
    const mtgCount = Array.from(cards.values()).filter(card => card.set).length; // Approximate MTG count

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
                <Loading />
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
            {/* Header */}
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Collection</h2>
                    <p className="text-sm opacity-70 mt-1">Inventory-first view of everything you own.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push("/collection/binders")}
                        className="
        px-3 py-1.5 rounded-md text-sm font-medium
        bg-black/5 dark:bg-white/5
        border border-[#42c99c] dark:border-[#82664e]
        hover:bg-black/10 dark:hover:bg-white/10
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
        dark:focus:ring-[#82664e]
      "
                    >
                        Binders
                    </button>
                </div>
            </section>

            {/* Stat tiles */}
            <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total Cards", value: totalCards.toString() },
                    { label: "Magic the Gathering", value: mtgCount.toString() },
                    { label: "Pokémon", value: "0" },
                    { label: "Yu-Gi-Oh!", value: "0" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="
              rounded-lg p-4
              border border-[#42c99c] dark:border-[#82664e]
              bg-[#e8d5b8] dark:bg-[#173c3f]
            "
                    >
                        <p className="text-xs opacity-70">{s.label}</p>
                        <p className="text-xl font-semibold mt-1">{s.value}</p>
                    </div>
                ))}
            </section>

            {/* Controls bar */}
            <section
                className="
          mb-4 rounded-lg p-3
          border border-[#42c99c] dark:border-[#82664e]
          bg-black/5 dark:bg-white/5
          flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between
        "
            >
                <input
                    placeholder="Search your collection…"
                    className="
            w-full lg:max-w-sm
            rounded-md px-3 py-2 text-sm
            bg-[#e8d5b8] dark:bg-[#173c3f]
            border border-[#42c99c] dark:border-[#82664e]
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
          "
                />

                <div className="flex flex-wrap items-center gap-2">
                    {["All", "MTG", "Pokémon", "Yu-Gi-Oh!"].map((t) => (
                        <button
                            key={t}
                            className="
                px-3 py-1.5 rounded-md text-sm
                bg-[#e8d5b8] dark:bg-[#173c3f]
                border border-[#42c99c] dark:border-[#82664e]
                hover:bg-black/10 dark:hover:bg-white/10
                transition-colors
              "
                        >
                            {t}
                        </button>
                    ))}

                    <button
                        className="
              px-3 py-1.5 rounded-md text-sm font-medium
              bg-[#e8d5b8] dark:bg-[#173c3f]
              border border-[#42c99c] dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
            "
                    >
                        Filters
                    </button>
                </div>
            </section>

            {/* Inventory list */}
            <section
                className="
          rounded-lg overflow-hidden
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#e8d5b8] dark:bg-[#173c3f]
        "
            >
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold opacity-80 border-b border-black/10 dark:border-white/10">
                    <div className="col-span-5">Card</div>
                    <div className="col-span-2">Set</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2">Tags</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Collection rows */}
                {collectionData && collectionData.items.length > 0 ? (
                    collectionData.items.map((item) => {
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
                                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
                                        <p className="text-xs opacity-70">MTG</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-xs opacity-80">{setName}</div>
                                <div className="col-span-1 text-center font-semibold">{item.quantity}</div>
                                <div className="col-span-2 text-xs opacity-80">
                                    {tags.length > 0 ? tags.join(" • ") : "—"}
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <button
                                        className="text-xs underline opacity-80 hover:opacity-100"
                                        onClick={() => {
                                            setEditCardListModalOpen(true);
                                            setEditCardList(item);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button className="text-xs underline opacity-80 hover:opacity-100">+1</button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="px-4 py-8 text-center text-sm opacity-70">
                        No cards in your collection yet. Start adding cards from sets!
                    </div>
                )}
            </section>

            {/* Pagination */}
            {collectionData && collectionData.pagination.totalPages > 1 && (
                <section className="mt-6 flex items-center justify-between">
                    <p className="text-sm opacity-70">
                        Showing {collectionData.items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                        {Math.min(currentPage * itemsPerPage, collectionData.pagination.total)} of {collectionData.pagination.total} cards
                    </p>
                    <div className="flex items-center gap-2">
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
                            {Array.from({ length: collectionData.pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    page === 1 ||
                                    page === collectionData.pagination.totalPages ||
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
                            onClick={() => setCurrentPage((p) => Math.min(collectionData.pagination.totalPages, p + 1))}
                            disabled={currentPage === collectionData.pagination.totalPages}
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

                    console.log("Saving card:", requestBody);

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

                    // Refresh collection data
                    const collectionResponse = await fetch(`/api/collection?page=${currentPage}&limit=${itemsPerPage}`);
                    if (!collectionResponse.ok) {
                        throw new Error("Failed to refresh collection data");
                    }

                    const data: CollectionData = await collectionResponse.json();
                    setCollectionData(data);

                    // Refresh card details for all items on current page
                    const cardsMap = new Map<string, ScryfallCard>();
                    for (const item of data.items) {
                        if (cards.has(item.cardId)) {
                            // Keep existing card data
                            cardsMap.set(item.cardId, cards.get(item.cardId)!);
                        } else {
                            // Fetch missing card data
                            try {
                                const cardResponse = await fetch(`/api/scryfall/card/${item.cardId}`);
                                if (cardResponse.ok) {
                                    const cardData = await cardResponse.json();
                                    cardsMap.set(item.cardId, cardData);
                                }
                            } catch (err) {
                                console.warn(`Failed to fetch card ${item.cardId}:`, err);
                            }
                        }
                    }
                    setCards(cardsMap);

                    // Close modal only after successful save and refresh
                    setEditCardListModalOpen(false);
                    setEditCardList(null);
                }}
            />
        </main>
    );
}