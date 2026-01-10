"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import Loading from "@/app/components/Loading";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
                <div className="flex-1 flex justify-end">
                    <button
                        className="
                            rounded-md px-3 py-1.5 text-sm font-medium
                            bg-[#42c99c] dark:bg-[#82664e]
                            text-white
                            hover:opacity-95
                        "
                    >
                        Edit
                    </button>
                </div>

            </section>
        </main>
    );
}