"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import Loading from "@/app/components/Loading";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import CommanderModal from "./commanderModal";
import { useToast } from "@/app/components/ToastContext";
import { FORMAT_RULES, type FormatKey, type FormatRules } from "@/app/lib/mtgFormatRules";
import type { ScryfallCard } from "@/app/lib/scryfall";
import { useDrawer } from "@/app/components/Drawer/drawerProvider";
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
    const { showToast } = useToast();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
    const [deckSideboard, setDeckSideboard] = useState<DeckSideboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { open } = useDrawer();
    const [cardDetails, setCardDetails] = useState<Map<string, ScryfallCard>>(new Map());
    const [ownedCounts, setOwnedCounts] = useState<Map<string, number>>(new Map());
    const [loadingCards, setLoadingCards] = useState(false);
    const [isCommanderModalOpen, setIsCommanderModalOpen] = useState(false);
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

    useEffect(() => {
        if (deckCards.length === 0) return;

        async function fetchCardDetails() {
            try {
                setLoadingCards(true);

                const collectionResponse = await fetch("/api/collection");
                if (collectionResponse.ok) {
                    const collectionData = await collectionResponse.json();
                    const collectionMap = new Map<string, number>();
                    Object.entries(collectionData.collection || {}).forEach(([cardId, qty]) => {
                        collectionMap.set(cardId, qty as number);
                    });
                    setOwnedCounts(collectionMap);
                }

                const cardDetailsMap = new Map<string, ScryfallCard>();
                const uniqueCardIds = [...new Set(deckCards.map((dc) => dc.cardId))];

                for (const cardId of uniqueCardIds) {
                    try {
                        const actualCardId = cardId.startsWith("c:") ? cardId.replace(/^c:/, "") : cardId;

                        if (cardDetailsMap.has(actualCardId) || cardDetailsMap.has(cardId)) {
                            if (cardId.startsWith("c:") && cardDetailsMap.has(actualCardId)) {
                                cardDetailsMap.set(cardId, cardDetailsMap.get(actualCardId)!);
                            }
                            continue;
                        }
                        
                        const cardResponse = await fetch(`https://api.scryfall.com/cards/${actualCardId}`);
                        if (cardResponse.ok) {
                            const cardData = await cardResponse.json();
                            cardDetailsMap.set(actualCardId, cardData);
                            if (cardId.startsWith("c:")) {
                                cardDetailsMap.set(cardId, cardData);
                            }
                        }
                    } catch {
                        // Scryfall failures: missing card data won't display details; deck still renders.
                    }
                }

                setCardDetails(cardDetailsMap);
            } catch {
                // Collection/card fetch failures don't block deck display; owned counts may be empty.
            } finally {
                setLoadingCards(false);
            }
        }

        fetchCardDetails();
    }, [deckCards]);

    const totalCards = useMemo(() => {
        return deckCards
            .filter((deckCard) => !deckCard.cardId.startsWith("c:"))
            .reduce((sum, deckCard) => sum + deckCard.quantity, 0);
    }, [deckCards]);

    const targetCards = useMemo(() => {
        if (!deck?.format) return null;
        
        const formatKey = deck.format as FormatKey;
        if (!FORMAT_RULES[formatKey]) return null;
        
        const rules = FORMAT_RULES[formatKey] as FormatRules;
        return rules.exactCards ?? rules.minCards ?? null;
    }, [deck]);

    const cardsByType = useMemo(() => {
        const grouped = new Map<string, Array<{ deckCard: DeckCard; scryfallCard: ScryfallCard }>>();

        deckCards.forEach((deckCard) => {
            if (deckCard.cardId.startsWith("c:")) return;
            
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
                const errorMessage = errorData.error || "Failed to update card quantity";
                showToast(errorMessage, "error");
                throw new Error(errorMessage);
            }

            if (newQuantity === 0) {
                setDeckCards((prev) => prev.filter((dc) => dc.id !== deckCard.id));
            } else {
                setDeckCards((prev) =>
                    prev.map((dc) => (dc.id === deckCard.id ? { ...dc, quantity: newQuantity } : dc))
                );
            }
            showToast(newQuantity > 0 ? "Card quantity updated." : "Card removed from deck.", "success");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update card quantity", "error");
            throw err;
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

            setDeckCards((prev) => prev.filter((dc) => dc.id !== deckCardId));
            showToast("Card removed from deck.", "success");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to remove card from deck", "error");
        }
    };

    const handleSetCommander = async (cardId: string) => {
        try {
            const existingCommanders = deckCards.filter((dc) => dc.cardId.startsWith("c:"));
            for (const commander of existingCommanders) {
                const actualCardId = commander.cardId.replace(/^c:/, "");

                await fetch(`/api/decks/${deckId}/cards/${commander.id}`, {
                    method: "DELETE",
                });

                const existingRegularCard = deckCards.find(
                    (dc) => dc.cardId === actualCardId &&                     !dc.cardId.startsWith("c:")
                );

                if (!existingRegularCard) {
                    await fetch(`/api/decks/${deckId}/cards`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            cardId: actualCardId,
                            quantity: 1,
                        }),
                    });
                }
            }

            const existingNewCommanderCard = deckCards.find(
                (dc) => dc.cardId === cardId && !dc.cardId.startsWith("c:")
            );
            
            if (existingNewCommanderCard) {
                await fetch(`/api/decks/${deckId}/cards/${existingNewCommanderCard.id}`, {
                    method: "DELETE",
                });
            }

            const commanderCardId = `c:${cardId}`;
            const response = await fetch(`/api/decks/${deckId}/cards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cardId: commanderCardId,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to set commander" }));
                const errorMessage = errorData.error || "Failed to set commander";
                showToast(errorMessage, "error");
                return;
            }

            const deckResponse = await fetch(`/api/decks/${deckId}`);
            if (deckResponse.ok) {
                const data = await deckResponse.json();
                setDeckCards(data.deck?.deckCards || []);
            }
        } catch (err) {
            throw err;
        }
    };

    // Get current commander card details
    const currentCommander = useMemo(() => {
        const commanderDeckCard = deckCards.find((dc) => dc.cardId.startsWith("c:"));
        if (!commanderDeckCard) return null;
        
        // Extract actual card ID (remove "c:" prefix)
        const actualCardId = commanderDeckCard.cardId.replace(/^c:/, "");
        const scryfallCard = cardDetails.get(actualCardId);
        
        return { deckCard: commanderDeckCard, scryfallCard, actualCardId };
    }, [deckCards, cardDetails]);

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

    if (!deck) {
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
                    <p className="text-lg opacity-70">Deck not found</p>
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
            <section className="flex items-center gap-2 px-4 py-3 border-b border-black/10 dark:border-white/10">
                <div className="flex-1 flex justify-start">
                    <button
                        className="
              inline-flex items-center gap-2
              text-sm opacity-70
              px-3 py-2 rounded-md
              border border-black/10 dark:border-[var(--theme-border)]/50
              hover:bg-black/10 dark:hover:bg-[var(--theme-accent)]/10
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
                        {deck.format || "Unknown Format"} •{" "}
                        {targetCards !== null 
                            ? `${totalCards} out of ${targetCards} cards`
                            : `${totalCards} card${totalCards !== 1 ? "s" : ""}`
                        }
                    </p>
                </div>

                <div className="flex-1 flex justify-end gap-2">
                    <button
                        className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-md text-sm
              bg-[var(--theme-accent)]
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
                        onClick={() => open("EDIT_DECK", {
                            deck,
                            onSuccess: async () => {
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
                                    // Error refreshing deck
                                }
                            }
                        })}
                        className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-md text-sm
              bg-[var(--theme-accent)]
              text-white
              hover:opacity-95
              transition-colors
            "
                    >
                        Edit Deck
                    </button>
                </div>
            </section>

            {/* Commander Section - Only show for Commander format decks */}
            {deck.format === "Commander" && (
                <section className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Commander</h3>
                        {currentCommander && (
                            <button
                                type="button"
                                onClick={() => setIsCommanderModalOpen(true)}
                                className="
                                    inline-flex items-center gap-2
                                    px-3 py-2 rounded-md text-sm
                                    bg-[var(--theme-sidebar)]
                                    border border-[var(--theme-border)]
                                    text-[var(--theme-fg)]
                                    hover:bg-[var(--theme-accent)] hover:text-white
                                    transition-colors
                                "
                            >
                                Change Commander
                            </button>
                        )}
                    </div>
                    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-6">
                        {currentCommander && currentCommander.scryfallCard ? (
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {(() => {
                                        const cardImage =
                                            currentCommander.scryfallCard.image_uris?.normal ||
                                            currentCommander.scryfallCard.image_uris?.large ||
                                            currentCommander.scryfallCard.image_uris?.small ||
                                            currentCommander.scryfallCard.card_faces?.[0]?.image_uris?.normal ||
                                            "/images/DeckHaven-Shield.png";
                                        return (
                                            <img
                                                src={cardImage}
                                                alt={currentCommander.scryfallCard.name}
                                                className="w-32 h-auto rounded-md"
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-semibold truncate">
                                        {currentCommander.scryfallCard.name}
                                    </h4>
                                    {currentCommander.scryfallCard.type_line && (
                                        <p className="text-sm opacity-70 mt-1">
                                            {currentCommander.scryfallCard.type_line}
                                        </p>
                                    )}
                                    {currentCommander.scryfallCard.oracle_text && (
                                        <p className="text-xs opacity-60 mt-2 line-clamp-3">
                                            {currentCommander.scryfallCard.oracle_text}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm opacity-70 mb-4">No commander selected</p>
                                <button
                                    type="button"
                                    onClick={() => setIsCommanderModalOpen(true)}
                                    className="
                                        inline-flex items-center gap-2
                                        px-4 py-2 rounded-md text-sm
                                        bg-[var(--theme-accent)]
                                        text-white
                                        hover:opacity-95
                                        transition-colors
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Commander
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}
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
                                        const formatKey = (deck?.format || "Standard") as FormatKey;
                                        const formatRules = FORMAT_RULES[formatKey] as FormatRules | undefined;
                                        const isSingletonFormat = formatRules?.singleton ?? false;

                                        return (
                                            <button
                                                key={deckCard.id}
                                                type="button"
                                                onClick={() =>
                                                    open("DECK_CARD_VIEW", {
                                                        card: scryfallCard,
                                                        deckCardId: deckCard.id,
                                                        cardId: deckCard.cardId,
                                                        quantity: deckCard.quantity,
                                                        isSingletonFormat,
                                                        onQuantityChange: async (newQuantity: number) => {
                                                            await updateDeckCardQuantity(deckCard, newQuantity);
                                                        },
                                                        onRemove: async () => {
                                                            await removeCardFromDeck(deckCard.id);
                                                        },
                                                    })
                                                }
                                                className={`
                          rounded-lg border p-3
                          border-[var(--theme-border)]
                          bg-[var(--theme-sidebar)]
                          flex flex-col gap-2
                          text-left
                          cursor-pointer
                          hover:ring-2 hover:ring-[var(--theme-accent)]/50
                          transition-all
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
                                                                bg-[var(--theme-bg)]
                                                                text-[var(--theme-fg)]
                                                                border border-black/20 dark:border-white/20
                                                                shadow-md
                                                            ">
                                                            x{deckCard.quantity}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-xs font-semibold text-center">
                                                    In deck: <span className="text-sm">x{deckCard.quantity}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            )}

            {/* Commander Modal */}
            {deck.format === "Commander" && (
                <CommanderModal
                    open={isCommanderModalOpen}
                    deckCards={deckCards}
                    cardDetails={cardDetails}
                    currentCommanderId={currentCommander?.deckCard.cardId || null}
                    onClose={() => setIsCommanderModalOpen(false)}
                    onSelect={handleSetCommander}
                />
            )}
        </main>
    );
}