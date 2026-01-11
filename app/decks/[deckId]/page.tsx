"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import Loading from "@/app/components/Loading";
import { ChevronLeft, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditDeckModal from "./editDeckModal";
import type { ScryfallCard } from "@/app/lib/scryfall";
import AddToCollectionControl from "@/app/components/AddToCollectionControl";

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
                const uniqueCardIds = [...new Set(deckCards.map(dc => dc.cardId))];

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

    // Group cards by type
    const cardsByType = useMemo(() => {
        const grouped = new Map<string, Array<{ deckCard: DeckCard; scryfallCard: ScryfallCard }>>();

        deckCards.forEach(deckCard => {
            const scryfallCard = cardDetails.get(deckCard.cardId);
            if (!scryfallCard) return;

            const typeLine = scryfallCard.type_line || "Other";
            let cardType = "Other";

            // Extract primary type
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

            if (!grouped.has(cardType)) {
                grouped.set(cardType, []);
            }

            // Add one entry per quantity
            for (let i = 0; i < deckCard.quantity; i++) {
                grouped.get(cardType)!.push({ deckCard, scryfallCard });
            }
        });

        // Sort types: Creatures, Lands, Instants, Sorceries, Artifacts, Enchantments, Planeswalkers, Battles, Other
        const typeOrder = ["Creature", "Land", "Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Battle", "Other"];
        const sorted = new Map<string, Array<{ deckCard: DeckCard; scryfallCard: ScryfallCard }>>();
        
        typeOrder.forEach(type => {
            if (grouped.has(type)) {
                sorted.set(type, grouped.get(type)!);
            }
        });

        // Add any remaining types
        grouped.forEach((cards, type) => {
            if (!sorted.has(type)) {
                sorted.set(type, cards);
            }
        });

        return sorted;
    }, [deckCards, cardDetails]);

    const updateOwnedCount = async (cardId: string, count: number) => {
        setOwnedCounts((prev) => {
            const next = new Map(prev);
            if (count === 0) {
                next.delete(cardId);
            } else {
                next.set(cardId, count);
            }
            return next;
        });

        try {
            await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, quantity: count }),
            });
        } catch (err) {
            console.error("Error updating collection:", err);
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
                        {deck.format || "Unknown Format"} • {deck._count.deckCards} card{deck._count.deckCards !== 1 ? "s" : ""}
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
                                <h3 className="text-lg font-semibold mb-3">{type} ({cards.length})</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {cards.map(({ deckCard, scryfallCard }, index) => {
                                        const cardImage = scryfallCard.image_uris?.normal ||
                                            scryfallCard.image_uris?.large ||
                                            scryfallCard.image_uris?.small ||
                                            scryfallCard.card_faces?.[0]?.image_uris?.normal ||
                                            "/images/DeckHaven-Shield.png";
                                        const ownedCount = ownedCounts.get(deckCard.cardId) || 0;
                                        const isInCollection = ownedCount > 0;

                                        return (
                                            <div
                                                key={`${deckCard.id}-${index}`}
                                                className={`
                                                    rounded-lg border p-3
                                                    border-[#42c99c] dark:border-[#82664e]
                                                    bg-[#e8d5b8] dark:bg-[#173c3f]
                                                    flex flex-col gap-2
                                                    ${!isInCollection ? "opacity-50" : ""}
                                                `}
                                            >
                                                <h4 className="text-sm font-semibold text-center truncate">
                                                    {scryfallCard.name}
                                                </h4>
                                                {cardImage && (
                                                    <img
                                                        src={cardImage}
                                                        alt={scryfallCard.name}
                                                        className="w-full h-auto rounded"
                                                    />
                                                )}
                                                <AddToCollectionControl
                                                    quantity={ownedCount}
                                                    onChange={(qty) => updateOwnedCount(deckCard.cardId, qty)}
                                                />
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