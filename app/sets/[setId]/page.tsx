"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import SetCards from "./SetCards";
import type { ScryfallCard } from "@/app/lib/scryfall";
import Loading from "@/app/components/Loading";

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

    // Resolve dynamic route param
    useEffect(() => {
        params.then((p) => setSetId(p.setId));
    }, [params]);

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

    const updateOwnedCount = (cardId: string, count: number) => {
        setOwnedCounts((prev) => {
            const next = new Map(prev);
            if (count === 0) {
                next.delete(cardId);
            } else {
                next.set(cardId, count);
            }
            return next;
        });
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
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <button
                        type="button"
                        onClick={() => router.push("/sets/browse")}
                        className="
              mb-2
              flex items-center gap-2
              text-sm opacity-80
              hover:opacity-100
              transition-opacity
            "
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Sets
                    </button>

                    <h2 className="text-2xl font-semibold">
                        {setName || "Unknown Set"}
                    </h2>

                    <p className="text-sm opacity-70 mt-2">
                        {cards.length} card{cards.length === 1 ? "" : "s"} in this set
                    </p>
                </div>
            </section>

            {/* Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                        />
                    );
                })}
            </section>
        </main>
    );
}
