/**
 * Sets Landing Page
 * 
 * Displays game selection interface where users can choose between
 * Magic the Gathering, Pokémon, or Yu-Gi-Oh! to browse sets.
 * Clicking a game navigates to the browse page filtered by that game.
 * 
 * @page
 * @route /sets
 */

"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameFilter } from "@/app/components/GameFilterContext";
import { useUser } from "@stackframe/stack";
import { useEffect, useState } from "react";

type CardGame = {
    id: string;
    name: string;
    imageSrc: string;
    ownedCount: number;
};

// Map game filter from BrandNav to sets page game IDs
const gameIdMap: Record<string, string> = {
    mtg: "mtg",
    pokemon: "ptcg",
    yugioh: "ytcg",
};

export default function Sets() {
    const router = useRouter();
    const { game } = useGameFilter();
    const user = useUser();
    const [games, setGames] = useState<CardGame[]>([
        {
            id: "mtg",
            name: "Magic the Gathering",
            imageSrc: "/images/DeckHaven-Shield.png",
            ownedCount: 0,
        },
        {
            id: "ptcg",
            name: "Pokémon",
            imageSrc: "/images/DeckHaven-Shield.png",
            ownedCount: 0,
        },
        {
            id: "ytcg",
            name: "Yu-Gi-Oh!",
            imageSrc: "/images/DeckHaven-Shield.png",
            ownedCount: 0,
        },
    ]);

    // Fetch collection counts by game
    useEffect(() => {
        if (!user) {
            // Reset to 0 if user is not logged in
            setGames(prev => prev.map(g => ({ ...g, ownedCount: 0 })));
            return;
        }

        async function fetchCollectionCounts() {
            try {
                // Fetch collection data - the API returns totalQuantity which is the sum of all quantities
                // We only need the first page to get the pagination metadata
                const response = await fetch("/api/collection?page=1&limit=1");
                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                
                // Currently all cards come from Scryfall (MTG only)
                // The totalQuantity field represents the sum of all card quantities in the collection
                // In the future, we may need to check card data to determine game
                // For now, all cards are MTG
                const mtgCount = data.pagination?.totalQuantity || 0;
                
                // Pokemon and Yu-Gi-Oh counts are 0 since no cards from those games exist yet
                // (all cards are from Scryfall which is MTG only)
                setGames(prev => prev.map(g => {
                    if (g.id === "mtg") {
                        return { ...g, ownedCount: mtgCount };
                    }
                    return { ...g, ownedCount: 0 };
                }));
            } catch (err) {
                // Silently fail - counts will remain at 0
            }
        }

        fetchCollectionCounts();
    }, [user]);

    // Don't render the page if a specific game is selected
    // GameFilterContext will handle navigation to /sets/browse
    if (game !== "all") {
        return null;
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
            {/* Page Header */}
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Sets</h2>
                <p className="text-sm opacity-70 mt-1">
                    Browse cards by game
                </p>
            </section>

            {/* Game Selection Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {games.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => router.push(`/sets/browse?game=${game.id}`)}
                        className="
                            relative rounded-lg
                            border border-[var(--theme-border)]
                            bg-[var(--theme-sidebar)]
                            p-6
                            cursor-pointer
                            transition-all duration-200 ease-out
                            hover:-translate-y-0.5
                            hover:border-[var(--theme-accent-hover)]
                            hover:shadow-[0_0_20px_rgba(130,102,78,0.2)]
                            dark:hover:shadow-[0_0_30px_rgba(66,201,156,0.35)]
                            "
                    >
                        {/* Game Image (DeckHaven logo) */}
                        <img
                            src={game.imageSrc}
                            alt={game.name}
                            className="w-14 h-14 mx-auto mb-4"
                        />

                        {/* Game Name */}
                        <h3 className="text-lg font-semibold text-center mb-1">
                            {game.name}
                        </h3>

                        {/* Owned Count */}
                        <p className="text-sm opacity-80 text-center">
                            {game.ownedCount} cards in collection
                        </p>
                    </div>
                ))}
            </section>

            {/* Card Scanner Placeholder */}
            <section className="mt-6">
                <div
                    className="
                        relative rounded-lg
                        border border-dashed border-[var(--theme-border)]
                        bg-transparent
                        p-6
                        flex flex-col items-center justify-center
                        text-center
                        opacity-70
                    "
                >
                    <PlusIcon className="w-6 h-6 mb-2" />
                    <p className="text-sm font-medium">Card Scanner</p>
                    <p className="text-xs opacity-70 mt-1">
                        Coming soon
                    </p>
                </div>
            </section>
        </main>
    );
}
