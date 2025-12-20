"use client";

import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import SetCard from "./SetCard";

type DemoSet = {
    id: string;
    name: string;
    game: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
    totalCount: number;
    releaseDate: string;
};

const demoSets: DemoSet[] = [
    {
        id: "set-1",
        name: "Set 1 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 1 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-2",
        name: "Set 2 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 2 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-3",
        name: "Set 3 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 3 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-4",
        name: "Set 4 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 4 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-5",
        name: "Set 5 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 5 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
];

export default function Sets() {
    // Track favorites per-set id
    const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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
            <section className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">My Sets</h2>
                <button
                    className="
            group
            text-sm font-medium
            flex items-center gap-2
            px-3 py-1.5
            rounded-md
            text-[#193f44] dark:text-[#e8d5b8]
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-all duration-200 ease-out
            hover:translate-x-0.5
            focus:outline-none
            focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
            cursor-pointer
          "
                >
                    Browse All Sets
                    <ArrowRightIcon
                        className="
                        w-4 h-4
                        transition-transform duration-200
                        group-hover:translate-x-1
                        "
                        // TO DO: make on click so that it is redirected to the all sets page
                    />
                </button>
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {demoSets.map((s) => (
                    <SetCard
                        key={s.id}
                        name={s.name}
                        game={s.game}
                        imageSrc={s.imageSrc}
                        description={s.description}
                        ownedCount={s.ownedCount}
                        totalCount={s.totalCount}
                        releaseDate={s.releaseDate}
                        isFavorited={favorites.has(s.id)}
                        onToggleFavorite={() => toggleFavorite(s.id)}
                        onClick={() => console.log("Card clicked", s.id)}
                    />
                ))}
            </section>
        </main>
    );
}