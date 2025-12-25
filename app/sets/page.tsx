"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type CardGame = {
    id: string;
    name: string;
    imageSrc: string;
    ownedCount: number;
};

const demoGames: CardGame[] = [
    {
        id: "mtg",
        name: "Magic the Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        ownedCount: 12,
    },
    {
        id: "ptcg",
        name: "Pokémon",
        imageSrc: "/images/DeckHaven-Shield.png",
        ownedCount: 12,
    },
    {
        id: "ytcg",
        name: "Yu-Gi-Oh!",
        imageSrc: "/images/DeckHaven-Shield.png",
        ownedCount: 12,
    },
    
];

export default function Sets() {
    const router = useRouter();

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
            {/* Page Header */}
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Sets</h2>
                <p className="text-sm opacity-70 mt-1">
                    Browse cards by game
                </p>
            </section>

            {/* Game Selection Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {demoGames.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => router.push(`/sets/browse?game=${game.id}`)}
                        className="
                            relative rounded-lg
                            border border-[#42c99c] dark:border-[#82664e]
                            bg-[#e8d5b8] dark:bg-[#173c3f]
                            p-6
                            cursor-pointer
                            transition-all duration-200 ease-out
                            hover:-translate-y-0.5
                            hover:border-[#2fbf8f]
                            dark:hover:border-[#9b7a5f]
                            hover:shadow-[0_0_20px_rgba(130,102,78,0.2)]
                            dark:hover:shadow-[0_0_30px_rgba(66,201,156,0.35)]
                            "
                    >
                        {/* Game Image */}
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
            {/* Scanner Placeholder */}
            <section className="mt-6">
                <div
                    className="
                        relative rounded-lg
                        border border-dashed border-[#42c99c] dark:border-[#82664e]
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