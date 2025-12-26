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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import SetCards from "./SetCards";
import type { ScryfallCard } from "@/app/lib/scryfall";
import Loading from "@/app/components/Loading";
import CardModal from "./cardModal";
import AddToCollectionControl from "@/app/components/AddToCollectionControl";

type PageProps = {
    params: Promise<{ setId: string }>;
};

export default function SetDetailPage({ params }: PageProps) {
    const router = useRouter();
    const [setId, setSetId] = useState<string | null>(null);
    const [setName, setSetName] = useState<string>("");
    const [cards, setCards] = useState<ScryfallCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ownedCounts, setOwnedCounts] = useState<Map<string, number>>(new Map());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
    const [wishlistedCards, setWishlistedCards] = useState<Set<string>>(new Set());

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

                setCards(allCards);
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
            <section className="mb-6 flex items-center justify-between">
                {/* Back Button - Left */}
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

                {/* Set Name and Card Count - Centered */}
                <div className="flex-1 flex flex-col items-center">
                    <h2 className="text-2xl font-semibold">
                        {setName || "Unknown Set"}
                    </h2>
                    <p className="text-sm opacity-70 mt-2">
                        {cards.length} card{cards.length === 1 ? "" : "s"} in this set
                    </p>
                </div>

                {/* Spacer for balance - same width as back button */}
                <div className="w-[120px]"></div>
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
                        />
                    );
                })}
            </section>

            {/* Card Modal */}
            <CardModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCard?.name}
            >
                {selectedCard && (
                    <div className="flex flex-col items-center gap-4">
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

                        {/* Card Details */}
                        <div className="w-full space-y-2">
                            {selectedCard.type_line && (
                                <p className="text-md opacity-80">
                                    <span className="font-semibold">Type:</span> {selectedCard.type_line}
                                </p>
                            )}

                            {selectedCard.mana_cost && (
                                <p className="text-md opacity-80">
                                    <span className="font-semibold">Mana Cost:</span> {selectedCard.mana_cost}
                                </p>
                            )}

                            {selectedCard.collector_number && (
                                <p className="text-md opacity-80">
                                    <span className="font-semibold">Collector Number:</span> #{selectedCard.collector_number}
                                </p>
                            )}

                            {selectedCard.rarity && (
                                <p className="text-md opacity-80">
                                    <span className="font-semibold">Rarity:</span> {selectedCard.rarity}
                                </p>
                            )}

                            {selectedCard.oracle_text && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">Oracle Text:</p>
                                    <p className="text-md opacity-80 whitespace-pre-wrap">
                                        {selectedCard.oracle_text}
                                    </p>
                                </div>
                            )}

                            {selectedCard.card_faces && selectedCard.card_faces.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">Card Faces:</p>
                                    {selectedCard.card_faces.map((face, index) => (
                                        <div key={index} className="mb-4 p-3 bg-black/5 dark:bg-white/5 rounded">
                                            <p className="text-sm font-semibold">{face.name}</p>
                                            {face.type_line && (
                                                <p className="text-md opacity-70">{face.type_line}</p>
                                            )}
                                            {face.mana_cost && (
                                                <p className="text-md opacity-70">Mana: {face.mana_cost}</p>
                                            )}
                                            {face.oracle_text && (
                                                <p className="text-md opacity-80 mt-2 whitespace-pre-wrap">
                                                    {face.oracle_text}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full mt-6 pt-4 border-t border-[#42c99c] dark:border-[#82664e]">
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
                                        // TODO: Implement add to deck functionality
                                        console.log("Add to deck:", selectedCard?.name);
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
                                        // TODO: Implement add to binder functionality
                                        console.log("Add to binder:", selectedCard?.name);
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
