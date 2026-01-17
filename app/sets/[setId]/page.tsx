/**
 * Set Detail Page
 * 
 * Displays all cards within a specific Magic: The Gathering set. Fetches set information
 * and all associated cards (including child sets) from Scryfall API. Cards are displayed
 * in numeric order by collector number, showing card name, image, description, and owned count.
 * 
 * This page is accessed when users click on a set from the browse page. It handles
 * fetching cards across multiple pages (Scryfall pagination) and combines parent and child
 * sets into a single unified view. Cards with 0 owned copies are grayed out until added
 * to the user's collection.
 * 
 * @page
 * @route /sets/[setId]
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, Filter, FilterIcon } from "lucide-react";
import SetCards from "./SetCards";
import type { ScryfallCard } from "@/app/lib/scryfall";
import Loading from "@/app/components/Loading";
import CardModal from "./cardModal";
import AddToCollectionControl from "@/app/components/AddToCollectionControl";
import SetCardFiltersModal from "./setCardFiltersModal";
import type { SetCardFilters } from "./setCardFilters";
import SelectBinderModal from "./selectBinderModal";
import SelectDeckModal from "./selectDeckModal";
import { useToast } from "@/app/components/ToastContext";

type PageProps = {
    params: Promise<{ setId: string }>;
};

export default function SetDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [setId, setSetId] = useState<string | null>(null);
    const [setName, setSetName] = useState<string>("");
    const [cards, setCards] = useState<ScryfallCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ownedCounts, setOwnedCounts] = useState<Map<string, number>>(new Map());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
    const [wishlistedCards, setWishlistedCards] = useState<Set<string>>(new Set());
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSelectBinderModalOpen, setIsSelectBinderModalOpen] = useState(false);
    const [isSelectDeckModalOpen, setIsSelectDeckModalOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<SetCardFilters>({
        cardType: "all",
        color: "all",
        rarity: "all",
        manaValue: "all",
    });
    const [allCards, setAllCards] = useState<ScryfallCard[]>([]); // Store all cards before filtering
    const [filteredCards, setFilteredCards] = useState<ScryfallCard[]>([]); // Store filtered cards
    const [displayedCount, setDisplayedCount] = useState(60); // Number of cards to display (10 rows × 6 cols)
    const CARDS_PER_BATCH = 60; // Load 60 cards per batch (10 rows)
    // Resolve dynamic route param
    useEffect(() => {
        params.then((p) => setSetId(p.setId));
    }, [params]);

    // Fetch user collection and wishlist from database
    useEffect(() => {
        async function fetchUserData() {
            try {
                // Fetch collection
                const collectionResponse = await fetch("/api/collection");
                if (collectionResponse.ok) {
                    const data = await collectionResponse.json();
                    const collectionMap = new Map<string, number>();
                    Object.entries(data.collection || {}).forEach(([cardId, qty]) => {
                        collectionMap.set(cardId, qty as number);
                    });
                    setOwnedCounts(collectionMap);
                }

                // Fetch wishlist
                const wishlistResponse = await fetch("/api/wishlist");
                if (wishlistResponse.ok) {
                    const data = await wishlistResponse.json();
                    setWishlistedCards(new Set(data.wishlist || []));
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        }

        fetchUserData();
    }, []);

    // Fetch set info and cards
    useEffect(() => {
        if (!setId) return;

        async function fetchSetData() {
            try {
                setLoading(true);
                setError(null);

                // First, get set info to check if it's a parent set
                const setsResponse = await fetch("/api/scryfall/sets");
                if (!setsResponse.ok) {
                    throw new Error("Failed to fetch sets");
                }
                const setsData = await setsResponse.json();
                const allSets = setsData.data;

                // Find the set and check for children
                const mainSet = allSets.find((s: any) => s.code === setId);
                if (!mainSet) {
                    throw new Error("Set not found");
                }

                setSetName(mainSet.name);

                // Find all child sets
                const childSets = allSets.filter((s: any) => s.parent_set_code === setId);
                const allSetCodes = [setId, ...childSets.map((s: any) => s.code)];

                // Fetch cards from all sets (parent + children)
                const allCards: ScryfallCard[] = [];
                let page = 1;
                let hasMore = true;

                for (const setCode of allSetCodes) {
                    hasMore = true;
                    page = 1;

                    while (hasMore) {
                        const cardsResponse = await fetch(
                            `/api/scryfall/cards?setCode=${setCode}&page=${page}`
                        );
                        if (!cardsResponse.ok) {
                            console.warn(`Failed to fetch cards for set ${setCode}`);
                            break;
                        }
                        const cardsData = await cardsResponse.json();
                        allCards.push(...cardsData.data);
                        hasMore = cardsData.has_more && cardsData.next_page;
                        page++;
                    }
                }

                // Sort by collector_number (numeric order, handling alphanumeric)
                allCards.sort((a, b) => {
                    const numA = a.collector_number || "0";
                    const numB = b.collector_number || "0";

                    // Extract numeric part
                    const matchA = numA.match(/^(\d+)/);
                    const matchB = numB.match(/^(\d+)/);
                    const numPartA = matchA ? parseInt(matchA[1]) : 0;
                    const numPartB = matchB ? parseInt(matchB[1]) : 0;

                    // If numeric parts are equal, compare the full string
                    if (numPartA === numPartB) {
                        return numA.localeCompare(numB, undefined, { numeric: true });
                    }

                    return numPartA - numPartB;
                });

                setAllCards(allCards);
                setFilteredCards(allCards);
                setCards(allCards.slice(0, CARDS_PER_BATCH)); // Show first batch initially
                setDisplayedCount(CARDS_PER_BATCH);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load set");
            } finally {
                setLoading(false);
            }
        }

        fetchSetData();
    }, [setId]);

    const updateOwnedCount = async (cardId: string, count: number) => {
        // Optimistically update UI
        setOwnedCounts((prev) => {
            const next = new Map(prev);
            if (count === 0) {
                next.delete(cardId);
            } else {
                next.set(cardId, count);
            }
            return next;
        });

        // Save to database
        try {
            await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, quantity: count }),
            });
        } catch (err) {
            console.error("Error updating collection:", err);
            // Revert on error
            setOwnedCounts((prev) => {
                const next = new Map(prev);
                const originalCount = ownedCounts.get(cardId) || 0;
                if (originalCount === 0) {
                    next.delete(cardId);
                } else {
                    next.set(cardId, originalCount);
                }
                return next;
            });
        }
    };

    const toggleWishlist = async (cardId: string) => {
        const isWishlisted = wishlistedCards.has(cardId);
        const newWishlisted = !isWishlisted;

        // Optimistically update UI
        setWishlistedCards((prev) => {
            const next = new Set(prev);
            if (newWishlisted) {
                next.add(cardId);
            } else {
                next.delete(cardId);
            }
            return next;
        });

        // Save to database
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, isWishlisted: newWishlisted }),
            });
        } catch (err) {
            console.error("Error updating wishlist:", err);
            // Revert on error
            setWishlistedCards((prev) => {
                const next = new Set(prev);
                if (isWishlisted) {
                    next.add(cardId);
                } else {
                    next.delete(cardId);
                }
                return next;
            });
        }
    };

    const handleCardClick = (card: ScryfallCard) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    // Filter cards based on selected filters
    const applyFilters = (newFilters: SetCardFilters) => {
        setFilters(newFilters);

        let filtered = [...allCards];

        // Filter by card type
        if (newFilters.cardType !== "all") {
            filtered = filtered.filter((card) => {
                const typeLine = card.type_line?.toLowerCase() || "";
                return typeLine.includes(newFilters.cardType.toLowerCase());
            });
        }

        // Filter by color
        if (newFilters.color !== "all") {
            filtered = filtered.filter((card) => {
                const colors = card.colors || [];
                if (newFilters.color === "colorless") {
                    return colors.length === 0;
                } else if (newFilters.color === "multicolor") {
                    return colors.length > 1;
                } else {
                    // Map filter color to Scryfall color code
                    const colorMap: Record<string, string> = {
                        white: "W",
                        blue: "U",
                        black: "B",
                        red: "R",
                        green: "G",
                    };
                    const colorCode = colorMap[newFilters.color];
                    return colors.includes(colorCode);
                }
            });
        }

        // Filter by rarity
        if (newFilters.rarity !== "all") {
            filtered = filtered.filter((card) => {
                return card.rarity?.toLowerCase() === newFilters.rarity.toLowerCase();
            });
        }

        // Filter by mana value (CMC)
        if (newFilters.manaValue !== "all") {
            filtered = filtered.filter((card) => {
                const cmc = card.cmc ?? 0;
                if (newFilters.manaValue === "7+") {
                    return cmc >= 7;
                } else {
                    const targetCmc = parseInt(newFilters.manaValue, 10);
                    return cmc === targetCmc;
                }
            });
        }

        setFilteredCards(filtered);
        setCards(filtered.slice(0, CARDS_PER_BATCH)); // Show first batch of filtered results
        setDisplayedCount(CARDS_PER_BATCH);
    };

    const clearFilters = () => {
        const clearedFilters: SetCardFilters = {
            cardType: "all",
            color: "all",
            rarity: "all",
            manaValue: "all",
        };
        setFilters(clearedFilters);
        setFilteredCards(allCards);
        setCards(allCards.slice(0, CARDS_PER_BATCH));
        setDisplayedCount(CARDS_PER_BATCH);
    };

    // Intersection Observer for infinite scroll
    const filteredCardsRef = useRef(filteredCards);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        filteredCardsRef.current = filteredCards;
    }, [filteredCards]);

    // Set up/recreate observer when sentinel element or displayedCount changes
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        // Clean up existing observer
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        // Only set up observer if we have more cards to load
        if (displayedCount >= filteredCardsRef.current.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setDisplayedCount((currentCount) => {
                        const currentFiltered = filteredCardsRef.current;
                        const newCount = currentCount + CARDS_PER_BATCH;
                        if (newCount <= currentFiltered.length) {
                            setCards(currentFiltered.slice(0, newCount));
                            return newCount;
                        }
                        return currentCount;
                    });
                }
            },
            {
                rootMargin: "200px", // Start loading 200px before reaching the sentinel
            }
        );

        observer.observe(sentinel);
        observerRef.current = observer;

        return () => {
            observer.disconnect();
            observerRef.current = null;
        };
    }, [displayedCount, filteredCards.length]);

    // Callback ref to store sentinel element reference
    const sentinelRefCallback = (node: HTMLDivElement | null) => {
        sentinelRef.current = node;
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
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loading />
                </div>
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
            <section className="mb-6 flex items-center sticky top-0 border-b border-black/10 dark:border-[#82664e]/10 bg-white dark:bg-[#0f2a2c] z-10">
                {/* Left: Back Button */}
                <div className="flex-1 flex justify-start">
                    <button
                        type="button"
                        onClick={() => router.push("/sets/browse")}
                        className="
        flex items-center gap-2
        text-sm opacity-80
        border border-[#42c99c] dark:border-[#82664e]
        bg-[#e8d5b8] dark:bg-[#173c3f]
        rounded-md p-2
        hover:bg-black/10 dark:hover:bg-white/10
        hover:opacity-100
        transition-opacity
      "
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Sets
                    </button>
                </div>

                {/* Center: Set Name + Count */}
                <div className="flex flex-col items-center text-center min-w-0 mt-2">
                    <h2 className="text-2xl font-semibold truncate">
                        {setName || "Unknown Set"}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                        {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""} {filteredCards.length !== allCards.length ? "filtered" : "in this set"}
                        {displayedCount < filteredCards.length && ` (showing ${displayedCount})`}
                    </p>
                </div>

                {/* Right: Controls */}
                <div className="flex-1 flex justify-end">
                    <div className="flex flex-col items-end gap-2">
                        {/* Row A: Always-visible utilities */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* Filters Button */}
                            <button
                                type="button"
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="
          flex items-center gap-2
          text-sm opacity-80
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#e8d5b8] dark:bg-[#173c3f]
          rounded-md p-2
          hover:bg-black/10 dark:hover:bg-white/10
          hover:opacity-100
          transition-opacity
        "
                            >
                                <FilterIcon className="w-4 h-4" />
                                Filters
                            </button>

                            {/* If NOT in selection mode, show Select Cards here too */}
                            {!isSelectionMode && (
                                <button
                                    type="button"
                                    onClick={() => setIsSelectionMode(true)}
                                    className="
            flex items-center gap-2
            text-sm opacity-80
            border border-[#42c99c] dark:border-[#82664e]
            bg-[#e8d5b8] dark:bg-[#173c3f]
            rounded-md p-2
            hover:bg-black/10 dark:hover:bg-white/10
            hover:opacity-100
            transition-opacity
          "
                                >
                                    Select Cards
                                </button>
                            )}
                        </div>

                        {/* Row B: Selection-mode actions */}
                        {isSelectionMode && (
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const displayedCardIds = new Set(cards.map(c => c.id));
                                        setSelectedCardIds(displayedCardIds);
                                    }}
                                    className="
            flex items-center gap-2
            text-sm opacity-80
            border border-[#42c99c] dark:border-[#82664e]
            bg-[#e8d5b8] dark:bg-[#173c3f]
            rounded-md p-2
            hover:bg-black/10 dark:hover:bg-white/10
            hover:opacity-100
            transition-opacity
          "
                                >
                                    Select All
                                </button>

                                {selectedCardIds.size > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsSelectBinderModalOpen(true)}
                                            className="
                flex items-center gap-2
                text-sm opacity-80
                border border-[#42c99c] dark:border-[#82664e]
                bg-[#e8d5b8] dark:bg-[#173c3f]
                rounded-md p-2
                hover:bg-black/10 dark:hover:bg-white/10
                hover:opacity-100
                transition-opacity
              "
                                        >
                                            Add to Binder ({selectedCardIds.size})
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsSelectDeckModalOpen(true)}
                                            className="
                flex items-center gap-2
                text-sm opacity-80
                border border-[#42c99c] dark:border-[#82664e]
                bg-[#e8d5b8] dark:bg-[#173c3f]
                rounded-md p-2
                hover:bg-black/10 dark:hover:bg-white/10
                hover:opacity-100
                transition-opacity
              "
                                        >
                                            Add to Deck ({selectedCardIds.size})
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedCardIds(new Set());
                                    }}
                                    className="
            flex items-center gap-2
            text-sm opacity-80
            border border-red-400 dark:border-red-600
            bg-[#e8d5b8] dark:bg-[#173c3f]
            rounded-md p-2
            hover:bg-black/10 dark:hover:bg-white/10
            hover:opacity-100
            transition-opacity
          "
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {cards.map((card) => {
                    const ownedCount = ownedCounts.get(card.id) || 0;
                    const cardImage = card.image_uris?.normal ||
                        card.image_uris?.large ||
                        card.image_uris?.small ||
                        card.card_faces?.[0]?.image_uris?.normal ||
                        "/images/DeckHaven-Shield.png";
                    const cardDescription = card.oracle_text ||
                        card.type_line ||
                        card.card_faces?.[0]?.oracle_text ||
                        "";

                    return (
                        <SetCards
                            key={card.id}
                            id={card.id}
                            name={card.name}
                            game="Magic the Gathering"
                            imageSrc={cardImage}
                            description={cardDescription}
                            ownedCount={ownedCount}
                            collectorNumber={card.collector_number}
                            onOwnedCountChange={(count) => updateOwnedCount(card.id, count)}
                            onCardClick={() => handleCardClick(card)}
                            isWishlisted={wishlistedCards.has(card.id)}
                            onWishlistToggle={() => toggleWishlist(card.id)}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedCardIds.has(card.id)}
                            onSelectionToggle={(selected) => {
                                setSelectedCardIds(prev => {
                                    const next = new Set(prev);
                                    if (selected) {
                                        next.add(card.id);
                                    } else {
                                        next.delete(card.id);
                                    }
                                    return next;
                                });
                            }}
                        />
                    );
                })}
            </section>

            {/* Scroll Sentinel for infinite scroll */}
            {displayedCount < filteredCards.length && (
                <div ref={sentinelRefCallback} className="h-10 flex items-center justify-center py-8">
                    <div className="text-sm opacity-70">Loading more cards...</div>
                </div>
            )}

            {/* Filters Modal */}
            <SetCardFiltersModal
                open={isFiltersOpen}
                filters={filters}
                onClose={() => setIsFiltersOpen(false)}
                onApply={applyFilters}
                onClear={clearFilters}
            />

            {/* Select Binder Modal */}
            <SelectBinderModal
                open={isSelectBinderModalOpen}
                cardId={isSelectionMode ? "" : (selectedCard?.id || "")}
                cardIds={isSelectionMode ? Array.from(selectedCardIds) : []}
                onClose={() => {
                    setIsSelectBinderModalOpen(false);
                    if (isSelectionMode) {
                        setIsSelectionMode(false);
                        setSelectedCardIds(new Set());
                    }
                }}
                onSelect={async (binderId: string, quantity: number) => {
                    const cardsToAdd = isSelectionMode ? Array.from(selectedCardIds) : (selectedCard ? [selectedCard.id] : []);

                    if (cardsToAdd.length === 0) return;

                    try {
                        // Add each card multiple times for quantity > 1
                        for (const cardId of cardsToAdd) {
                            for (let i = 0; i < quantity; i++) {
                                const response = await fetch(`/api/binders/${binderId}/cards`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        cardId: cardId,
                                        slotNumber: null, // Let API find first empty slot
                                    }),
                                });

                                if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({ error: "Failed to add card to binder" }));
                                    throw new Error(errorData.error || "Failed to add card to binder");
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Error adding cards to binder:", err);
                        alert(err instanceof Error ? err.message : "Failed to add cards to binder");
                        throw err;
                    }
                }}
            />

            {/* Select Deck Modal */}
            <SelectDeckModal
                open={isSelectDeckModalOpen}
                cardId={isSelectionMode ? "" : (selectedCard?.id || "")}
                cardIds={isSelectionMode ? Array.from(selectedCardIds) : []}
                onClose={() => {
                    setIsSelectDeckModalOpen(false);
                    if (isSelectionMode) {
                        setIsSelectionMode(false);
                        setSelectedCardIds(new Set());
                    }
                }}
                onSelect={async (deckId: string, quantity: number) => {
                    const cardsToAdd = isSelectionMode ? Array.from(selectedCardIds) : (selectedCard ? [selectedCard.id] : []);

                    if (cardsToAdd.length === 0) return;

                    try {
                        // Add each card with the specified quantity
                        for (const cardId of cardsToAdd) {
                            const response = await fetch(`/api/decks/${deckId}/cards`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    cardId: cardId,
                                    quantity: quantity,
                                }),
                            });

                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ error: "Failed to add card to deck" }));
                                const errorMessage = errorData.error || "Failed to add card to deck";
                                showToast(errorMessage, "error");
                                // Continue processing other cards instead of throwing
                                continue;
                            }
                        }
                    } catch (err) {
                        console.error("Error adding cards to deck:", err);
                        // Error already shown via toast, don't throw to prevent modal from closing if multiple cards
                    }
                }}
            />

            {/* Card Modal */}
            <CardModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCard?.name}
            >
                {selectedCard && (
                    <div className="flex flex-col items-center gap-6">
                        {/* Card Image */}
                        {(() => {
                            const cardImage = selectedCard.image_uris?.normal ||
                                selectedCard.image_uris?.large ||
                                selectedCard.image_uris?.small ||
                                selectedCard.card_faces?.[0]?.image_uris?.normal ||
                                "/images/DeckHaven-Shield.png";
                            return (
                                <img
                                    src={cardImage}
                                    alt={selectedCard.name}
                                    className="w-full max-w-sm rounded-md"
                                />
                            );
                        })()}

                        {/* Action Buttons */}
                        <div className="w-full pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex items-center justify-center w-full">
                                    {selectedCard && (
                                        <AddToCollectionControl
                                            quantity={ownedCounts.get(selectedCard.id) || 0}
                                            onChange={(qty) => updateOwnedCount(selectedCard.id, qty)}
                                            className="w-full"
                                        />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedCard) {
                                            toggleWishlist(selectedCard.id);
                                        }
                                    }}
                                    className={`
                                        px-4 py-2 rounded-md
                                        text-sm font-medium
                                        border border-[#42c99c] dark:border-[#82664e]
                                        transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                        ${selectedCard && wishlistedCards.has(selectedCard.id)
                                            ? "bg-[#42c99c] dark:bg-[#82664e] text-white"
                                            : "bg-[#e8d5b8] dark:bg-[#173c3f] text-[#193f44] dark:text-[#e8d5b8] hover:bg-[#42c99c] hover:text-white dark:hover:bg-[#82664e] dark:hover:text-[#e8d5b8]"
                                        }
                                    `}
                                >
                                    {selectedCard && wishlistedCards.has(selectedCard.id)
                                        ? "Remove from Wishlist"
                                        : "Add to Wishlist"
                                    }
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedCard) {
                                            setIsSelectDeckModalOpen(true);
                                        }
                                    }}
                                    className="
                                        px-4 py-2 rounded-md
                                        text-sm font-medium
                                        border border-[#42c99c] dark:border-[#82664e]
                                        bg-[#e8d5b8] dark:bg-[#173c3f]
                                        text-[#193f44] dark:text-[#e8d5b8]
                                        hover:bg-[#42c99c] hover:text-white
                                        dark:hover:bg-[#82664e] dark:hover:text-[#e8d5b8]
                                        transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                >
                                    Add to Deck
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedCard) {
                                            setIsSelectBinderModalOpen(true);
                                        }
                                    }}
                                    className="
                                        px-4 py-2 rounded-md
                                        text-sm font-medium
                                        border border-[#42c99c] dark:border-[#82664e]
                                        bg-[#e8d5b8] dark:bg-[#173c3f]
                                        text-[#193f44] dark:text-[#e8d5b8]
                                        hover:bg-[#42c99c] hover:text-white
                                        dark:hover:bg-[#82664e] dark:hover:text-[#e8d5b8]
                                        transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                >
                                    Add to Binder
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardModal>
        </main>
    );
}
