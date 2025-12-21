"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import SetCard from "./browseCard";

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
        id: "set-11",
        name: "Set 1 Name",
        game: "Pokemon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 1 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-22",
        name: "Set 2 Name",
        game: "Pokemon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 2 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-33",
        name: "Set 3 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 3 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-44",
        name: "Set 4 Name",
        game: "Magic: The Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 4 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
    {
        id: "set-55",
        name: "Set 5 Name",
        game: "Yu-Gi-Oh!",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 5 Description",
        ownedCount: 12,
        totalCount: 165,
        releaseDate: "Month Day, Year",
    },
];

export default function BrowseSets() {
    const router = useRouter();

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
                <h2 className="text-2xl font-semibold">Browse All Sets</h2>

                <button
                    type="button"
                    onClick={() => router.push("/sets")}
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
                    Back to My Sets
                    <ArrowRightIcon
                        className="
              w-4 h-4
              transition-transform duration-200
              group-hover:translate-x-1
            "
                    />
                </button>
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {demoSets.map((s) => (
                    <SetCard
                        key={s.id}
                        id={s.id}
                        name={s.name}
                        game={s.game}
                        imageSrc={s.imageSrc}
                        description={s.description}
                        ownedCount={s.ownedCount}
                        totalCount={s.totalCount}
                        releaseDate={s.releaseDate}
                        isFavorited={favorites.has(s.id)}
                        onToggleFavorite={() => toggleFavorite(s.id)}
                        href={`/sets/${s.id}`}
                    />
                ))}
            </section>
        </main>
    );
}