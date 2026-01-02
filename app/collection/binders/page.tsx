/**
 * Binders Page
 * 
 * Displays the user's binders in a grid format. Allows for creating, editing, and deleting binders.
 * 
 * @page
 * @route /collection/binders
 */


// TODO: Add ability to add cards to binders
// TODO: Add ability to remove cards from binders
// TODO: Add ability to edit layout of cards in binders - move cards around, like a drag and drop interface
// TODO: Add ability to delete cards
// TODO: Add ability pagination
// TODO: Add page flipping animaiton for the binder pages
// TODO: Add ability to export binders as CSV
// TODO: Add ability to import binders from CSV
// TODO: Add ability to export binders as JSON
// TODO: Add ability to import binders from JSON

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import NewBinderModal from "./newBinderModal";
import Loading from "@/app/components/Loading";
import OpenBinderModal from "./openBinderModal";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameFilter } from "@/app/components/GameFilterContext";

type Binder = {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    game: string | null; // "all" (favorites), "mtg", "pokemon", "yugioh" - null means favorites/all games
    createdAt: string;
    updatedAt: string;
    _count: {
        binderCards: number;
    };
    binderCards?: Array<{
        cardId: string;
    }>;
};

// Small helper: map your simple color names to nicer “binder cover” tints.
// If you already store hex values, those will still work (we pass them through).
function binderCoverColor(color: string | null): string {
    if (!color) return "#ffffff";

    const c = color.toLowerCase();
    const map: Record<string, string> = {
        white: "#ffffff",
        black: "#111827",
        slate: "#475569",
        stone: "#78716c",
        red: "#ef4444",
        rose: "#f43f5e",
        orange: "#f97316",
        amber: "#f59e0b",
        blue: "#3b82f6",
        sky: "#0ea5e9",
        cyan: "#06b6d4",
        teal: "#14b8a6",
        green: "#22c55e",
        emerald: "#10b981",
        lime: "#84cc16",
        purple: "#8b5cf6",
        violet: "#7c3aed",
        pink: "#ec4899",
        gold: "#d4af37",
    };

    return map[c] ?? color; // if it's already a hex/rgb, use it
}

function BinderPreview({
    coverColor,
    pocketCount = 9,
}: {
    coverColor: string;
    pocketCount?: number;
}) {
    return (
        <div
            className="
        relative overflow-hidden
        rounded-xl
        border border-black/10 dark:border-white/10
        bg-white/60 dark:bg-black/10
      "
        >
            {/* “Binder cover” tint */}
            <div
                className="absolute inset-0 opacity-[0.16]"
                style={{ backgroundColor: coverColor }}
            />

            {/* Left spine + rings */}
            <div className="absolute inset-y-0 left-0 w-10 border-r border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <div className="absolute left-1/2 top-6 -translate-x-1/2 flex flex-col gap-5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="relative">
                            {/* hole */}
                            <div className="h-3.5 w-3.5 rounded-full border border-black/20 dark:border-white/20 bg-[#f6ead6] dark:bg-[#0f2a2c]" />
                            {/* ring shadow hint */}
                            <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 dark:border-white/10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pocket page */}
            <div className="relative pl-12 pr-3 py-3">
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: pocketCount }).map((_, idx) => (
                        <div
                            key={idx}
                            className="
                aspect-[2.5/3.5]
                rounded-md
                border border-black/10 dark:border-white/10
                bg-white/70 dark:bg-white/5
                shadow-sm
              "
                        >
                            {/* subtle “card back” pattern */}
                            <div className="h-full w-full rounded-md bg-black/0 dark:bg-black/0" />
                        </div>
                    ))}
                </div>
            </div>

            {/* glossy sleeve highlight */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        </div>
    );
}

export default function BindersPage() {
    const user = useUser();
    const { game } = useGameFilter();
    const [isOpen, setIsOpen] = useState(false);
    const [binders, setBinders] = useState<Binder[]>([]);
    const [allBinders, setAllBinders] = useState<Binder[]>([]); // Store all binders for filtering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openBinderModal, setOpenBinderModal] = useState(false);
    const [selectedBinder, setSelectedBinder] = useState<Binder | null>(null);
    const router = useRouter();

    // Fetch binders
    useEffect(() => {
        if (!user) return;

        async function fetchBinders() {
            try {
                setLoading(true);
                setError(null);

                // Build query string with game filter
                const gameParam = game === "all" ? "" : `?game=${game}`;
                const response = await fetch(`/api/binders${gameParam}`);
                if (!response.ok) throw new Error("Failed to fetch binders");

                const data = await response.json();
                setAllBinders(data.binders || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load binders");
            } finally {
                setLoading(false);
            }
        }

        fetchBinders();
    }, [user, game]);

    // Filter binders by game
    useEffect(() => {
        if (allBinders.length === 0) {
            setBinders([]);
            return;
        }

        // Filter binders based on their game field
        const filteredBinders = allBinders.filter((binder) => {
            const binderGame = binder.game || "all"; // null means "all" (favorites)

            if (game === "all") {
                // Show all binders when "all" is selected
                return true;
            }

            // Show binders that match the selected game OR are favorites (null/"all")
            return binderGame === game || binderGame === "all";
        });

        setBinders(filteredBinders);
    }, [allBinders, game]);

    const handleBinderCreated = async () => {
        try {
            // Build query string with game filter
            const gameParam = game === "all" ? "" : `?game=${game}`;
            const response = await fetch(`/api/binders${gameParam}`);
            if (!response.ok) throw new Error("Failed to refresh binders");

            const data = await response.json();
            setAllBinders(data.binders || []);

            // Update selectedBinder if modal is open and binder was edited
            if (selectedBinder && openBinderModal) {
                const updatedBinder = data.binders?.find((b: Binder) => b.id === selectedBinder.id);
                if (updatedBinder) {
                    setSelectedBinder(updatedBinder);
                }
            }
        } catch (err) {
            console.error("Failed to refresh binders:", err);
        }
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
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.push("/collection")}
                        className="
                            inline-flex items-center gap-2
                            text-sm opacity-70
                            hover:opacity-100
                            hover:underline
                            transition
                        "
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Collection
                    </button>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold">Binders</h2>
                    <p className="text-sm opacity-70 mt-1 mb-4">
                        Create and manage your favorite binder layouts.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-black/5 dark:bg-white/5 border border-[#42c99c] dark:border-[#82664e] hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                        onClick={() => setIsOpen(true)}
                    >
                        Add Binder
                    </button>
                </div>
            </section>

            {/* Binders Grid */}
            {binders.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 z-10">
                    {binders.map((binder) => {
                        // Use the binderCoverColor function to get the hex color
                        const coverColor = binderCoverColor(binder.color);
                        
                        // Determine text color based on brightness (light colors need dark text)
                        const isLightColor = binder.color === "yellow" || 
                                            binder.color === "white" || 
                                            binder.color === "lime" ||
                                            binder.color === "amber" ||
                                            binder.color === "orange" ||
                                            binder.color === "sky" ||
                                            binder.color === "cyan";
                        const coverTextClass = isLightColor ? "text-neutral-900" : "text-white";

                        return (
                            <button
                                key={binder.id}
                                type="button"
                                className="
        group relative text-left w-full
        rounded-xl
        focus:outline-none
        border-0
        outline-none
      "
                                onClick={() => {
                                    setSelectedBinder(binder);
                                    setOpenBinderModal(true);
                                }}
                            >
                                {/* “Binder cover” */}
                                <div
                                    className="
          relative overflow-hidden rounded-xl
          shadow-lg
          transition-transform duration-200
          group-hover:-translate-y-6
          aspect-[3/4]
          border-0
        "
                                    style={{ backgroundColor: coverColor }}
                                >
                                    {/* subtle leather/plastic sheen */}
                                    <div className="pointer-events-none absolute inset-0 opacity-25 bg-gradient-to-br from-white/40 via-transparent to-black/30" />

                                    {/* spine (left strip) - subtle binding edge */}
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-black/15" />
                                    <div className="pointer-events-none absolute inset-y-0 left-6 w-px bg-white/10" />

                                    {/* Centered content on cover */}
                                    <div className="relative h-full flex flex-col items-center justify-center px-6 pl-10 text-center">
                                        <div
                                            className={`
                                            w-full max-w-[90%]
                                            rounded-md border border-white/20 bg-black/20 backdrop-blur-[1px]
                                            px-4 py-3
                                            ${coverTextClass}
                                            `}
                                        >
                                            <h3 className="text-base font-semibold leading-snug line-clamp-2">
                                                {binder.name}
                                            </h3>

                                            {binder.description ? (
                                                <p className={`mt-2 text-xs opacity-85 line-clamp-2 ${coverTextClass}`}>
                                                    {binder.description}
                                                </p>
                                            ) : null}
                                        </div>

                                        {/* bottom info like a small stamp */}
                                        <div className={`mt-5 text-xs opacity-90 ${coverTextClass}`}>
                                            {binder._count.binderCards}{" "}
                                            {binder._count.binderCards === 1 ? "card" : "cards"}
                                        </div>
                                    </div>

                                    {/* table-cast shadow edge */}
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 opacity-30 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>
                            </button>
                        );
                    })}
                </section>
            ) : (
                <section
                    className="
            rounded-lg p-12 text-center
            border border-[#42c99c] dark:border-[#82664e]
            bg-[#e8d5b8] dark:bg-[#173c3f]
          "
                >
                    <p className="text-sm opacity-70 mb-4">
                        No binders yet. Create your first binder to get started!
                    </p>
                    <button
                        className="px-4 py-2 rounded-md text-sm font-medium bg-[#42c99c] dark:bg-[#82664e] text-white hover:opacity-95 transition-opacity"
                        onClick={() => setIsOpen(true)}
                    >
                        Create Binder
                    </button>
                </section>
            )}

            <NewBinderModal open={isOpen} onClose={() => setIsOpen(false)} onSuccess={handleBinderCreated} />
            <OpenBinderModal
                open={openBinderModal}
                binder={selectedBinder}
                onClose={() => {
                    setOpenBinderModal(false);
                    setSelectedBinder(null);
                }}
                onSuccess={handleBinderCreated}
            />
        </main>
    );
}