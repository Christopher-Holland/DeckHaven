/**
 * Search Page
 * 
 * Displays search results for cards from Scryfall. Users can search for cards
 * by name and view results with options to add to collection, wishlist, decks, or binders.
 * 
 * @page
 * @route /search
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, Heart } from "lucide-react";
import type { ScryfallCard } from "@/app/lib/scryfall";
import AddToCollectionControl from "@/app/components/AddToCollectionControl";
import AddToWishlist from "@/app/components/AddToWishlist";
import Loading from "@/app/components/Loading";
import { useToast } from "@/app/components/ToastContext";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const query = searchParams.get("q") || "";
    
    const [searchQuery, setSearchQuery] = useState(query);
    const [results, setResults] = useState<ScryfallCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ownedCards, setOwnedCards] = useState<Map<string, number>>(new Map());
    const [wishlistedCards, setWishlistedCards] = useState<Set<string>>(new Set());

    // Fetch owned cards and wishlist
    useEffect(() => {
        async function fetchUserData() {
            try {
                // Fetch collection
                const collectionResponse = await fetch("/api/collection?page=1&limit=1000");
                if (collectionResponse.ok) {
                    const collectionData = await collectionResponse.json();
                    const ownedMap = new Map<string, number>();
                    collectionData.items.forEach((item: { cardId: string; quantity: number }) => {
                        ownedMap.set(item.cardId, item.quantity);
                    });
                    setOwnedCards(ownedMap);
                }

                // Fetch wishlist
                const wishlistResponse = await fetch("/api/wishlist");
                if (wishlistResponse.ok) {
                    const wishlistData = await wishlistResponse.json();
                    const ids = wishlistData.wishlist || [];
                    setWishlistedCards(new Set(ids));
                }
            } catch (err) {
                // Silently fail - user data is optional
            }
        }

        fetchUserData();
    }, []);

    // Perform search when query changes
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        async function performSearch() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/scryfall/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error("Failed to search cards");
                }

                const data = await response.json();
                setResults(data.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to search cards");
                setResults([]);
            } finally {
                setLoading(false);
            }
        }

        performSearch();
    }, [query]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleQuantityChange = async (cardId: string, quantity: number) => {
        try {
            const response = await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cardId,
                    quantity,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update collection");
            }

            // Update local state
            setOwnedCards(prev => {
                const next = new Map(prev);
                if (quantity > 0) {
                    next.set(cardId, quantity);
                } else {
                    next.delete(cardId);
                }
                return next;
            });
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update collection", "error");
        }
    };

    const handleWishlistToggle = async (cardId: string) => {
        try {
            const isWishlisted = wishlistedCards.has(cardId);
            const newWishlisted = !isWishlisted;
            const response = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId, isWishlisted: newWishlisted }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to update wishlist");
            }

            // Update local state
            setWishlistedCards(prev => {
                const next = new Set(prev);
                if (newWishlisted) {
                    next.add(cardId);
                } else {
                    next.delete(cardId);
                }
                return next;
            });
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to update wishlist", "error");
        }
    };

    return (
        <main className="min-h-[calc(100vh-8rem)] bg-[var(--theme-bg)] px-6 py-6 text-[var(--theme-fg)]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold mb-2">Search Cards</h1>
                    <p className="text-sm opacity-70">Search for Magic: The Gathering cards by name</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for cards (e.g., Lightning Bolt, set:MH2)..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--theme-border)] rounded-md bg-[var(--theme-card)] text-[var(--theme-fg)] placeholder-[var(--theme-fg)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                        />
                    </div>
                </form>

                {/* Results */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loading message="Searching..." />
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/50 px-4 py-3">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {!loading && !error && query && results.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-sm opacity-70 mb-2">No results found</p>
                        <p className="text-xs opacity-60">Try a different search term</p>
                    </div>
                )}

                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {results.map((card) => {
                            const cardImage = card.image_uris?.normal || 
                                            card.image_uris?.large || 
                                            card.image_uris?.small ||
                                            card.card_faces?.[0]?.image_uris?.normal ||
                                            null;
                            const ownedQuantity = ownedCards.get(card.id) || 0;
                            const isWishlisted = wishlistedCards.has(card.id);

                            return (
                                <div
                                    key={card.id}
                                    className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4 hover:border-[var(--theme-accent-hover)] transition-all duration-200"
                                >
                                    {cardImage && (
                                        <img
                                            src={cardImage}
                                            alt={card.name}
                                            className="w-full h-auto rounded mb-3"
                                        />
                                    )}
                                    <h3 className="text-sm font-semibold mb-1 line-clamp-2">{card.name}</h3>
                                    <p className="text-xs opacity-70 mb-3">{card.set_name}</p>
                                    
                                    <div className="space-y-2">
                                        <AddToCollectionControl
                                            quantity={ownedQuantity}
                                            onChange={(qty) => handleQuantityChange(card.id, qty)}
                                        />
                                        <AddToWishlist
                                            isWishlisted={isWishlisted}
                                            onToggle={() => handleWishlistToggle(card.id)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!query && (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm opacity-70">Enter a search query to find cards</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <main className="min-h-[calc(100vh-8rem)] bg-[var(--theme-bg)] px-6 py-6 text-[var(--theme-fg)]">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold mb-2">Search Cards</h1>
                    </div>
                    <div className="flex justify-center py-12">
                        <Loading message="Loading..." />
                    </div>
                </div>
            </main>
        }>
            <SearchContent />
        </Suspense>
    );
}
