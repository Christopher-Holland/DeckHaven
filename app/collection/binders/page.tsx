/**
 * Binders Page
 *
 * Displays the user's binders as closed Vault X–style zip binders.
 * Allows creating and opening binders.
 *
 * @page
 * @route /collection/binders
 */

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import Loading from "@/app/components/Loading";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGameFilter } from "@/app/components/GameFilterContext";
import { useDrawer } from "@/app/components/Drawer/drawerProvider";
import { isLightHex, paddedMaterialStyle } from "@/app/lib/binderMaterial";

type Binder = {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    spineColor: string | null;
    pageColor: string | null;
    game: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        binderCards: number;
    };
    binderCards?: Array<{
        cardId: string;
    }>;
};

function ZipperEdge({ edge }: { edge: "top" | "right" | "bottom" | "left" }) {
    const isHorizontal = edge === "top" || edge === "bottom";
    return (
        <div
            aria-hidden="true"
            className={`
                pointer-events-none absolute z-20
                ${edge === "top" ? "top-0 inset-x-2 h-1.5" : ""}
                ${edge === "bottom" ? "bottom-0 inset-x-2 h-1.5" : ""}
                ${edge === "left" ? "left-0 inset-y-2 w-1.5" : ""}
                ${edge === "right" ? "right-0 inset-y-2 w-1.5" : ""}
            `}
            style={{
                backgroundImage: isHorizontal
                    ? "repeating-linear-gradient(90deg, #2a2a2a 0 3px, #6b6b6b 3px 4px, #1a1a1a 4px 7px, #8a8a8a 7px 8px)"
                    : "repeating-linear-gradient(180deg, #2a2a2a 0 3px, #6b6b6b 3px 4px, #1a1a1a 4px 7px, #8a8a8a 7px 8px)",
                opacity: 0.85,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
            }}
        />
    );
}

function BinderCoverCard({ binder }: { binder: Binder }) {
    const coverColor = binder.color || "#1a1a1a";
    const spineColor = binder.spineColor || "#111111";
    const light = isLightHex(coverColor);
    const plateFg = light ? "rgba(20,20,20,0.92)" : "rgba(245,245,245,0.95)";
    const plateMuted = light ? "rgba(20,20,20,0.55)" : "rgba(245,245,245,0.55)";
    const plateBorder = light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.22)";
    const plateBg = light ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)";
    const cardCount = binder._count.binderCards;

    return (
        <div className="relative pb-3">
            {/* Soft oval cast onto the felt — sits under the binder */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute left-[6%] right-[4%] bottom-0 h-5
                    rounded-[100%]
                    bg-black/55 blur-md
                    transition-all duration-200
                    group-hover:left-[4%] group-hover:right-[2%] group-hover:bottom-[-2px]
                    group-hover:h-6 group-hover:bg-black/40 group-hover:blur-lg
                "
            />
            {/* Tight contact line where the binder meets the mat */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute left-[10%] right-[8%] bottom-1.5 h-1.5
                    rounded-[100%]
                    bg-black/50 blur-[2px]
                    transition-opacity duration-200
                    group-hover:opacity-40
                "
            />

            <div
                className="
                    relative overflow-hidden rounded-sm
                    aspect-[3/4]
                    transition-transform duration-200
                    group-hover:-translate-y-2
                "
                style={{
                    ...paddedMaterialStyle(coverColor),
                    boxShadow: [
                        "0 1px 1px rgba(0,0,0,0.35)",
                        "0 4px 8px rgba(0,0,0,0.28)",
                        "0 12px 24px rgba(0,0,0,0.32)",
                        "0 22px 40px rgba(0,0,0,0.22)",
                    ].join(", "),
                }}
            >
                {/* Soft padding bevel */}
                <div
                    aria-hidden="true"
                    className="absolute inset-[5px] rounded-sm pointer-events-none"
                    style={{
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 0 20px rgba(0,0,0,0.25)",
                    }}
                />

                {/* Closed binder: zipper on three outer edges */}
                <ZipperEdge edge="top" />
                <ZipperEdge edge="right" />
                <ZipperEdge edge="bottom" />

                {/* Padded spine strip */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-7 sm:w-8"
                    style={paddedMaterialStyle(spineColor)}
                >
                    <div
                        className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[2px]"
                        style={{
                            background:
                                "repeating-linear-gradient(180deg, rgba(255,255,255,0.35) 0 3px, transparent 3px 8px)",
                            opacity: 0.5,
                        }}
                    />
                    <div
                        className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3 h-3.5 rounded-[2px]"
                        style={{
                            background: "linear-gradient(180deg, #c0c0c0, #6a6a6a)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        }}
                    />
                </div>
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-7 sm:left-8 w-px bg-black/30"
                />

                {/* Embossed nameplate */}
                <div className="relative h-full flex flex-col items-center justify-center px-5 pl-11 sm:pl-12 text-center">
                    <div
                        className="w-full max-w-[92%] rounded-sm px-3.5 py-3"
                        style={{
                            color: plateFg,
                            background: plateBg,
                            border: `1px solid ${plateBorder}`,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.2)",
                            backdropFilter: "blur(2px)",
                        }}
                    >
                        <p
                            className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] mb-1"
                            style={{ color: plateMuted }}
                        >
                            DeckHaven
                        </p>
                        <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 tracking-tight">
                            {binder.name}
                        </h3>
                        {binder.description ? (
                            <p className="mt-1.5 text-xs line-clamp-2 leading-snug" style={{ color: plateMuted }}>
                                {binder.description}
                            </p>
                        ) : null}
                    </div>

                    <div
                        className="mt-4 text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: plateMuted }}
                    >
                        {cardCount} {cardCount === 1 ? "card" : "cards"}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BindersPage() {
    const user = useUser();
    const { game } = useGameFilter();
    const { open } = useDrawer();
    const [binders, setBinders] = useState<Binder[]>([]);
    const [allBinders, setAllBinders] = useState<Binder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        async function fetchBinders() {
            try {
                setLoading(true);
                setError(null);

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

    useEffect(() => {
        if (allBinders.length === 0) {
            setBinders([]);
            return;
        }

        const filteredBinders = allBinders.filter((binder) => {
            const binderGame = binder.game || "all";

            if (game === "all") {
                return true;
            }

            return binderGame === game || binderGame === "all";
        });

        setBinders(filteredBinders);
    }, [allBinders, game]);

    const handleBinderCreated = async () => {
        try {
            const gameParam = game === "all" ? "" : `?game=${game}`;
            const response = await fetch(`/api/binders${gameParam}`);
            if (!response.ok) throw new Error("Failed to refresh binders");

            const data = await response.json();
            setAllBinders(data.binders || []);
        } catch {
            // Failed to refresh binders
        }
    };

    if (loading) {
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
                <Loading />
            </main>
        );
    }

    if (error) {
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
        bg-[var(--theme-bg)]
        px-6 py-6
        text-[var(--theme-fg)]
        transition-all duration-300
      "
        >
            <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                <div className="sm:text-center">
                    <h2 className="text-2xl font-semibold">Binders</h2>
                    <p className="text-sm opacity-70 mt-1 mb-0 sm:mb-4">
                        Create and manage your favorite binder layouts.
                    </p>
                </div>
                <div className="flex items-center sm:justify-end gap-2">
                    <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-black/5 dark:bg-white/5 border border-[var(--theme-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                        onClick={() => open("NEW_BINDER", { onSuccess: handleBinderCreated })}
                    >
                        Add Binder
                    </button>
                </div>
            </section>

            {binders.length > 0 ? (
                <section
                    className="
                        relative inline-block max-w-full rounded-lg p-5 sm:p-7
                        border border-black/40
                    "
                    style={{
                        background:
                            "radial-gradient(ellipse at center, #3a4540 0%, #1c2420 70%, #121816 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.35)",
                    }}
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.14] rounded-lg"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
                        }}
                    />

                    <div className="relative flex flex-wrap gap-5 sm:gap-6">
                        {binders.map((binder) => (
                            <button
                                key={binder.id}
                                type="button"
                                className="group relative text-left w-[min(100%,220px)] sm:w-[240px] rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
                                onClick={() => {
                                    router.push(`/collection/binders/${binder.id}`);
                                }}
                            >
                                <BinderCoverCard binder={binder} />
                            </button>
                        ))}
                    </div>
                </section>
            ) : (
                <section
                    className="
            rounded-lg p-12 text-center
            border border-[var(--theme-border)]
            bg-[var(--theme-sidebar)]
          "
                >
                    <p className="text-sm opacity-70 mb-4">
                        No binders yet. Create your first binder to get started!
                    </p>
                    <button
                        className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--theme-accent)] text-white hover:opacity-95 transition-opacity"
                        onClick={() => open("NEW_BINDER", { onSuccess: handleBinderCreated })}
                    >
                        Create Binder
                    </button>
                </section>
            )}
        </main>
    );
}
