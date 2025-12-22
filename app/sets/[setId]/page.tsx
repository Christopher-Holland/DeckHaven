"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, StarIcon } from "lucide-react";

type Set = {
    id: string;
    name: string;
    game: string;
    imageSrc: string;
    description: string;
    ownedCount: number;
};

const demoSets: Set[] = [
    {
        id: "set-1",
        name: "Set 1 Name",
        game: "Pokemon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 1 Description",
        ownedCount: 12,
    },
    {
        id: "set-2",
        name: "Set 2 Name",
        game: "Pokemon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 2 Description",
        ownedCount: 12,
    },
    {
        id: "set-3",
        name: "Set 3 Name",
        game: "Magic the Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 3 Description",
        ownedCount: 12,
    },
    {
        id: "set-4",
        name: "Set 4 Name",
        game: "Magic the Gathering",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 4 Description",
        ownedCount: 12,
    },
    {
        id: "set-5",
        name: "Set 5 Name",
        game: "Yu-Gi-Oh!",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 5 Description",
        ownedCount: 12,
    },
    {
        id: "set-6",
        name: "Set 6 Name",
        game: "Digimon",
        imageSrc: "/images/DeckHaven-Shield.png",
        description: "Set 6 Description",
        ownedCount: 12,
    },
];

type PageProps = {
    params: Promise<{ setId: string }>;
};

export default function SetDetailPage({ params }: PageProps) {
    const router = useRouter();
    const [setId, setSetId] = useState<string | null>(null);
    const [set, setSet] = useState<Set | null>(null);

    // Resolve dynamic route param
    useEffect(() => {
        params.then((p) => setSetId(p.setId));
    }, [params]);

    // Lookup set once we have setId
    useEffect(() => {
        if (!setId) return;
        const found = demoSets.find((s) => s.id === setId) ?? null;
        setSet(found);
    }, [setId]);

    if (!setId) return null;

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
                        onClick={() => router.push("/sets")}
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
                        {set?.name ?? "Unknown Set"}
                    </h2>

                    {set?.game && (
                        <div className="mt-1">
                            <span className="inline-block text-md px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                                {set.game}
                            </span>
                        </div>
                    )}

                    <p className="text-sm opacity-70 mt-2">
                        Set details and card list will appear here.
                    </p>
                </div>

                {/* Favorite button placeholder */}
                <button
                    type="button"
                    className="
            p-2 rounded-md
            border border-[#42c99c] dark:border-[#82664e]
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
          "
                    aria-label="Favorite set"
                >
                    <StarIcon className="w-5 h-5" />
                </button>
            </section>

            {/* Filters placeholder */}
            <section
                className="
          mb-6
          rounded-lg
          border border-dashed border-[#42c99c] dark:border-[#82664e]
          p-4
          text-sm opacity-70
        "
            >
                Set-specific filters will go here
            </section>

            {/* Card grid placeholder */}
            <section
                className="
          rounded-lg
          border border-dashed border-[#42c99c] dark:border-[#82664e]
          p-6
          text-center
          opacity-80
        "
            >
                <p className="font-medium">No cards loaded yet</p>
                <p className="text-sm opacity-70 mt-2">
                    This page will display all cards belonging to this set.
                </p>
            </section>
        </main>
    );
}