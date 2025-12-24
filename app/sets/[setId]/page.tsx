"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SetCards from "./SetCards";

type SetItem = {
    id: string;
    name: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
};

export default function SetsGamePage() {
    const game = "mtg"; // replace with your params logic like your Cards page

    const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const demoSets = useMemo<SetItem[]>(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: `${game}-set-${i + 1}`,
            name: `Set ${i + 1}`,
            imageSrc: "/images/DeckHaven-Shield.png",
            description: `Placeholder set description for Set ${i + 1}.`,
            ownedCount: Math.floor(Math.random() * 25),
        }));
    }, [game]);

    return (
        <main
            className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
      "
        >
            <section className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Sets</h2>
                    <p className="text-sm opacity-70 mt-1">Browse sets for this game.</p>
                </div>

                <Link
                    href="/sets"
                    className="
            text-sm font-medium px-3 py-1.5 rounded-md
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
          "
                >
                    Back to Sets
                </Link>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {demoSets.map((s) => (
                    <SetCards
                        key={s.id}
                        id={s.id}
                        name={s.name}
                        game={game.toUpperCase()}
                        imageSrc={s.imageSrc}
                        description={s.description}
                        ownedCount={s.ownedCount}
                        href={`/sets/${game}/${s.id}`}
                    />
                ))}
            </section>
        </main>
    );
}