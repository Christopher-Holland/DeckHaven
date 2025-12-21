import Link from "next/link";

const GAME_LABELS: Record<string, string> = {
    mtg: "Magic: The Gathering",
    ptcg: "Pokémon",
    ytcg: "Yu-Gi-Oh!",
};

type PageProps = {
    params: Promise<{ game: string }>;
};

export default async function GamePage({ params }: PageProps) {
    const { game } = await params;
    const gameName = GAME_LABELS[game] ?? game.toUpperCase();

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
            <section className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{gameName}</h2>
                    <p className="text-sm opacity-70 mt-1">
                        Library page placeholder — browse + filters will live here.
                    </p>
                </div>

                <Link
                    href="/cards"
                    className="
            text-sm font-medium
            px-3 py-1.5 rounded-md
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
          "
                >
                    Back to Cards
                </Link>
            </section>

            <section
                className="
          rounded-lg
          border border-dashed border-[#42c99c] dark:border-[#82664e]
          p-6
          text-center
          opacity-80
        "
            >
                <p className="font-medium">No card database connected yet</p>
                <p className="text-sm opacity-70 mt-2">
                    Later this page will support browsing, filtering, and viewing card
                    details. For now, this is a structural placeholder.
                </p>
            </section>
        </main>
    );
}