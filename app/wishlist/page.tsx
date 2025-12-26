/**
 * Wishlist Page
 * 
 * Displays all cards in the user's wishlist. Fetches wishlist data from the database
 * and displays cards with their details. Users can remove items from their wishlist.
 * 
 * @page
 * @route /wishlist
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import Loading from "@/app/components/Loading";
import AddToCollectionControl from "@/app/components/AddToCollectionControl";
import type { ScryfallCard } from "@/app/lib/scryfall";

function WishlistContent() {
    const user = useUser();
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [cards, setCards] = useState<Map<string, ScryfallCard>>(new Map());
    const [ownedCounts, setOwnedCounts] = useState<Map<string, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch wishlist and collection
    useEffect(() => {
        if (!user) return;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch wishlist
                const wishlistResponse = await fetch("/api/wishlist");
                if (!wishlistResponse.ok) {
                    throw new Error("Failed to fetch wishlist");
                }
                const wishlistData = await wishlistResponse.json();
                const cardIds = wishlistData.wishlist || [];
                setWishlist(cardIds);

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

                // Fetch card details from Scryfall for each card in wishlist
                const cardsMap = new Map<string, ScryfallCard>();
                for (const cardId of cardIds) {
                    try {
                        const cardResponse = await fetch(`https://api.scryfall.com/cards/${cardId}`);
                        if (cardResponse.ok) {
                            const cardData = await cardResponse.json();
                            cardsMap.set(cardId, cardData);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch card ${cardId}:`, err);
                    }
                }
                setCards(cardsMap);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load wishlist");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    const removeFromWishlist = async (cardId: string) => {
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, isWishlisted: false }),
            });
            setWishlist((prev) => prev.filter((id) => id !== cardId));
            setCards((prev) => {
                const next = new Map(prev);
                next.delete(cardId);
                return next;
            });
        } catch (err) {
            console.error("Error removing from wishlist:", err);
        }
    };

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
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Wishlist</h2>
                <p className="text-sm opacity-70 mt-1">
                    {wishlist.length} card{wishlist.length === 1 ? "" : "s"} in your wishlist
                </p>
            </section>

            {/* Cards Grid */}
            {wishlist.length === 0 ? (
                <section className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-lg opacity-80 mb-2">Your wishlist is empty</p>
                        <p className="text-sm opacity-60">
                            Add cards to your wishlist from any set page
                        </p>
                    </div>
                </section>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from(cards.entries()).map(([cardId, card]) => {
                        const cardImage = card.image_uris?.normal ||
                            card.image_uris?.large ||
                            card.image_uris?.small ||
                            card.card_faces?.[0]?.image_uris?.normal ||
                            "/images/DeckHaven-Shield.png";

                        return (
                            <div
                                key={cardId}
                                className="
                                    rounded-lg
                                    border border-[#42c99c] dark:border-[#82664e]
                                    bg-[#e8d5b8] dark:bg-[#173c3f]
                                    p-4
                                    flex flex-col gap-3
                                "
                            >
                                <h3 className="text-md font-semibold text-center">{card.name}</h3>
                                {cardImage && (
                                    <img
                                        src={cardImage}
                                        alt={card.name}
                                        className="w-full h-auto rounded"
                                    />
                                )}
                                <div className="flex flex-col gap-2">
                                    <AddToCollectionControl
                                        quantity={ownedCounts.get(cardId) || 0}
                                        onChange={(qty) => updateOwnedCount(cardId, qty)}
                                    />
                                    <button
                                        onClick={() => removeFromWishlist(cardId)}
                                        className="
                                            w-full px-3 py-1.5 rounded-md text-sm
                                            border border-red-500/50
                                            bg-red-500/10
                                            text-red-600 dark:text-red-400
                                            hover:bg-red-500/20
                                            transition-colors
                                        "
                                    >
                                        Remove from Wishlist
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}
        </main>
    );
}

export default function WishlistPage() {
    return (
        <Suspense fallback={
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
        }>
            <WishlistContent />
        </Suspense>
    );
}

