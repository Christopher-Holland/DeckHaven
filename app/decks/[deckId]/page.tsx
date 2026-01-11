"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import Loading from "@/app/components/Loading";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import EditDeckModal from "./editDeckModal";
import type { ScryfallCard } from "@/app/lib/scryfall";

type Deck = {
    id: string;
    name: string;
    description: string | null;
    format: string | null;
    game: string;
    deckBoxColor: string | null;
    trimColor: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        deckCards: number;
    };
    deckCards?: Array<{
        id: string;
        cardId: string;
        quantity: number;
    }>;
};

type DeckCard = {
    id: string;
    cardId: string;
    quantity: number;
    condition: string | null;
    language: string | null;
    isFoil: boolean;
};

type DeckSideboard = {
    id: string;
    cardId: string;
    quantity: number;
    condition: string | null;
    language: string | null;
    isFoil: boolean;
};

export default function DeckPage() {
    const user = useUser();
    const params = useParams();
    const deckId = params?.deckId as string;
    const [deck, setDeck] = useState<Deck | null>(null);
    const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
    const [deckSideboard, setDeckSideboard] = useState<DeckSideboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [cardDetails, setCardDetails] = useState<Map<string, ScryfallCard>>(new Map());
    const [ownedCounts, setOwnedCounts] = useState<Map<string, number>>(new Map());
    const [loadingCards, setLoadingCards] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!user || !deckId) return;

        async function fetchDeck() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/decks/${deckId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: "Failed to fetch deck" }));
                    throw new Error(errorData.error || "Failed to fetch deck");
                }

                const data = await response.json();
                if (data.deck) {
                    setDeck(data.deck);
                    setDeckCards(data.deck.deckCards || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load deck");
            } finally {
                setLoading(false);
            }
        }

        fetchDeck();
    }, [user, deckId]);

    // Fetch card details and collection when deckCards change
    useEffect(() => {
        if (deckCards.length === 0) return;

        async function fetchCardDetails() {
            try {
                setLoadingCards(true);

                // Fetch collection
                const collectionResponse = await fetch("/api/collection");
                if (collectionResponse.ok) {
                    const collectionData = await collectionResponse.json();
                    const collectionMap = new Map<string, number>();
                    Object.entries(collectionData.collection || {}).forEach(([cardId, qty]) => {
                        collectionMap.set(cardId, qty as number);
                    });
                    setOwnedCounts(collectionMap);
                }

                // Fetch card details from Scryfall
                const cardDetailsMap = new Map<string, ScryfallCard>();
                const uniqueCardIds = [...new Set(deckCards.map((dc) => dc.cardId))];

                for (const cardId of uniqueCardIds) {
                    try {
                        const cardResponse = await fetch(`https://api.scryfall.com/cards/${cardId}`);
                        if (cardResponse.ok) {
                            const cardData = await cardResponse.json();
                            cardDetailsMap.set(cardId, cardData);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch card ${cardId}:`, err);
                    }
                }

                setCardDetails(cardDetailsMap);
            } catch (err) {
                console.error("Error fetching card details:", err);
            } finally {
                setLoadingCards(false);
            }
        }

        fetchCardDetails();
    }, [deckCards]);

    // Calculate total card count (sum of quantities)
    const totalCards = useMemo(() => {
        return deckCards.reduce((sum, deckCard) => sum + deckCard.quantity, 0);
    }, [deckCards]);

    // Group cards by type (ONE tile per unique card, keep quantity on the deckCard)
    const cardsByType = useMemo(() => {
        const grouped = new Map<string, Array<{ deckCard: DeckCard; scryfallCard: ScryfallCard }>>();

        deckCards.forEach((deckCard) => {
            const scryfallCard = cardDetails.get(deckCard.cardId);
            if (!scryfallCard) return;

            const typeLine = scryfallCard.type_line || "Other";
            let cardType = "Other";

            if (typeLine.toLowerCase().includes("creature")) {
                cardType = "Creature";
            } else if (typeLine.toLowerCase().includes("land")) {
                cardType = "Land";
            } else if (typeLine.toLowerCase().includes("instant")) {
                cardType = "Instant";
            } else if (typeLine.toLowerCase().includes("sorcery")) {
                cardType = "Sorcery";
            } else if (typeLine.toLowerCase().includes("artifact")) {
                cardType = "Artifact";
            } else if (typeLine.toLowerCase().includes("enchantment")) {
                cardType = "Enchantment";
            } else if (typeLine.toLowerCase().includes("planeswalker")) {
                cardType = "Planeswalker";
            } else if (typeLine.toLowerCase().includes("battle")) {
                cardType = "Battle";
            }

            if (!grouped.has(cardType)) grouped.set(cardType, []);
            grouped.get(cardType)!.push({ deckCard, scryfallCard });
        });

        // Sort types: Creatures, Lands, Instants, Sorceries, Artifacts, Enchantments, Planeswalkers, Battles, Other
        const typeOrder = ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Battle", "Land", "Other"];
        const sorted = new Map<string, Array<{ deckCard: DeckCard; scryfallCard: ScryfallCard }>>();

        typeOrder.forEach((type) => {
            if (grouped.has(type)) sorted.set(type, grouped.get(type)!);
        });

        grouped.forEach((cards, type) => {
            if (!sorted.has(type)) sorted.set(type, cards);
        });

        return sorted;
    }, [deckCards, cardDetails]);

    const updateDeckCardQuantity = async (deckCard: DeckCard, newQuantity: number) => {
        try {
            const response = await fetch(`/api/decks/${deckId}/cards/${deckCard.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to update card quantity" }));
                throw new Error(errorData.error || "Failed to update card quantity");
            }

            // Update local state
            if (newQuantity === 0) {
                // Remove from deck
                setDeckCards((prev) => prev.filter((dc) => dc.id !== deckCard.id));
            } else {
                // Update quantity
                setDeckCards((prev) =>
                    prev.map((dc) => (dc.id === deckCard.id ? { ...dc, quantity: newQuantity } : dc))
                );
            }
        } catch (err) {
            console.error("Error updating card quantity:", err);
            alert(err instanceof Error ? err.message : "Failed to update card quantity");
        }
    };

    const removeCardFromDeck = async (deckCardId: string) => {
        try {
            const response = await fetch(`/api/decks/${deckId}/cards/${deckCardId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to remove card from deck" }));
                throw new Error(errorData.error || "Failed to remove card from deck");
            }

            // Remove from local state
            setDeckCards((prev) => prev.filter((dc) => dc.id !== deckCardId));
        } catch (err) {
            console.error("Error removing card from deck:", err);
            alert(err instanceof Error ? err.message : "Failed to remove card from deck");
        }
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

    if (!deck) {
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
                    <p className="text-lg opacity-70">Deck not found</p>
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
            <section className="flex items-center gap-2 px-4 py-3 border-b border-black/10 dark:border-white/10">
                <div className="flex-1 flex justify-start">
                    <button
                        className="
              inline-flex items-center gap-2
              text-sm opacity-70
              px-3 py-2 rounded-md
              border border-black/10 dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-[#82664e]/10
              transition-colors
            "
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Decks</span>
                    </button>
                </div>

                <div className="flex flex-col items-center text-center min-w-0">
                    <h2 className="text-3xl font-semibold truncate">{deck.name}</h2>
                    <p className="text-sm opacity-70 mt-1">
                        {deck.format || "Unknown Format"} • {totalCards} card{totalCards !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex-1 flex justify-end gap-2">
                    <button
                        className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-md text-sm
              bg-[#42c99c] dark:bg-[#82664e]
              text-white
              hover:opacity-95
              transition-colors
            "
                        onClick={() => router.push(`/sets`)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Card
                    </button>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-md text-sm
              bg-[#42c99c] dark:bg-[#82664e]
              text-white
              hover:opacity-95
              transition-colors
            "
                    >
                        Edit Deck
                    </button>
                </div>
            </section>

            {/* Cards by Type */}
            {deckCards.length > 0 && (
                <section className="mt-6 space-y-6">
                    {loadingCards ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-sm opacity-70">Loading cards...</div>
                        </div>
                    ) : (
                        Array.from(cardsByType.entries()).map(([type, cards]) => (
                            <div key={type}>
                                <h3 className="text-lg font-semibold mb-3">
                                    {type} (
                                    {cards.reduce((sum, x) => sum + (x.deckCard.quantity ?? 0), 0)}
                                    )
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {cards.map(({ deckCard, scryfallCard }) => {
                                        const cardImage =
                                            scryfallCard.image_uris?.normal ||
                                            scryfallCard.image_uris?.large ||
                                            scryfallCard.image_uris?.small ||
                                            scryfallCard.card_faces?.[0]?.image_uris?.normal ||
                                            "/images/DeckHaven-Shield.png";

                                        const ownedCount = ownedCounts.get(deckCard.cardId) || 0;
                                        const missing = ownedCount === 0;

                                        return (
                                            <div
                                                key={deckCard.id}
                                                className={`
                          rounded-lg border p-3
                          border-[#42c99c] dark:border-[#82664e]
                          bg-[#e8d5b8] dark:bg-[#173c3f]
                          flex flex-col gap-2
                          ${missing ? "opacity-80" : ""}
                        `}
                                            >
                                                <h4 className="text-sm font-semibold text-center truncate">
                                                    {scryfallCard.name}
                                                </h4>

                                                {/* Stacked visual + quantity badge */}
                                                <div className="relative">
                                                    {deckCard.quantity > 1 && (
                                                        <div
                                                            className="absolute -left-1 -top-1 w-full h-full rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
                                                            aria-hidden
                                                        />
                                                    )}
                                                    {deckCard.quantity > 2 && (
                                                        <div
                                                            className="absolute -left-2 -top-2 w-full h-full rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
                                                            aria-hidden
                                                        />
                                                    )}

                                                    <img
                                                        src={cardImage}
                                                        alt={scryfallCard.name}
                                                        className="relative w-full h-auto rounded"
                                                    />

                                                    {deckCard.quantity > 1 && (
                                                        <span
                                                            className="
                                                                absolute top-2 right-2
                                                                inline-flex items-center
                                                                px-2.5 py-1
                                                                rounded-full
                                                                text-md font-extrabold
                                                                bg-[#f6ead6] dark:bg-[#0f2a2c]
                                                                text-[#193f44] dark:text-[#e8d5b8]
                                                                border border-black/20 dark:border-white/20
                                                                shadow-md
                                                            ">
                                                            x{deckCard.quantity}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Owned indicator (no +/- control here) */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-xs font-semibold">
                                                        In deck: <span className="text-sm">x{deckCard.quantity}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1 border border-black/10 dark:border-white/10 rounded-md overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateDeckCardQuantity(deckCard, deckCard.quantity - 1)}
                                                            className="px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10"
                                                            aria-label="Remove one copy"
                                                        >
                                                            –
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateDeckCardQuantity(deckCard, deckCard.quantity + 1)}
                                                            className="px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10"
                                                            aria-label="Add one copy"
                                                        >
                                                            +
                                                        </button>
                                                         
                                                    </div>
                                                </div>

                                                <button
                                                    className="
                            rounded-lg border p-1
                            text-sm opacity-70
                            border-[#42c99c] dark:border-[#82664e]
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            flex flex-col gap-2
                            hover:opacity-95
                            hover:text-red-500
                            transition-colors
                          "
                                                    onClick={() => removeCardFromDeck(deckCard.id)}
                                                >
                                                    Remove all copies from Deck
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            )}

            {/* Edit Deck Modal */}
            <EditDeckModal
                open={isEditModalOpen}
                deck={deck}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={async () => {
                    // Refresh deck data after successful update
                    try {
                        const response = await fetch(`/api/decks/${deckId}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.deck) {
                                setDeck(data.deck);
                                setDeckCards(data.deck.deckCards || []);
                            }
                        }
                    } catch (err) {
                        console.error("Error refreshing deck:", err);
                    }
                }}
            />
        </main>
    );
}