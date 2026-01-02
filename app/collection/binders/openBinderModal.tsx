"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash, X } from "lucide-react";
import EditBinderModal from "./editBinderModal";

type Binder = {
    id: string;
    game?: string | null; // "mtg" | "pokemon" | "yugioh" | null
    name: string;
    description?: string | null;
    color?: string | null; // "white" | "black" | "red" | etc, or hex
    size?: string | null; // "2x2" | "3x3" | "4x4"
    _count?: { binderCards: number };
};

type BinderCard = {
    id: string;
    imageUrl?: string | null; // optional for later
    title?: string | null;    // optional for tooltip
};

type Props = {
    open: boolean;
    binder: Binder | null;
    cards?: BinderCard[]; // optional (can be empty); used to fill pockets
    onClose: () => void;
    onSuccess?: () => void;
};

function normalizeBinderColor(color?: string | null) {
    if (!color) return "#2a4b4f"; // default cover tone

    // allow named colors from your modal: white/black/red/blue/green/yellow
    const named: Record<string, string> = {
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

    return named[color] ?? color; // supports hex strings too
}

export default function OpenBinderModal({ open, binder, cards = [], onClose, onSuccess }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    // Escape to close
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const coverColor = useMemo(() => normalizeBinderColor(binder?.color), [binder?.color]);

    // Determine grid size from binder size (default to 3x3 if not set)
    const gridSize = useMemo(() => {
        const size = binder?.size || "3x3";
        if (size === "2x2") return { cols: 2, total: 4 };
        if (size === "4x4") return { cols: 4, total: 16 };
        return { cols: 3, total: 9 }; // default 3x3
    }, [binder?.size]);

    // Fill pockets based on grid size. If fewer cards than pockets, remainder are empty.
    const pageSlots = useMemo(() => {
        const slots = Array.from({ length: gridSize.total }, (_, i) => cards[i] ?? null);
        return slots;
    }, [cards, gridSize.total]);

    if (!open || !binder) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-label="Open Binder"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onMouseDown={onClose} />

            {/* Modal Shell */}
            <div
                className="
          relative w-[min(1100px,96vw)] max-h-[92vh]
          overflow-hidden
          rounded-2xl
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#f6ead6] dark:bg-[#0f2a2c]
          text-[#193f44] dark:text-[#e8d5b8]
          shadow-2xl
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 border-b border-black/10 dark:border-white/10">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">{binder.name}</h3>
                        <p className="text-sm opacity-70 truncate">
                            {binder.description?.trim()
                                ? binder.description
                                : `${binder._count?.binderCards ?? cards.length} cards`}
                        </p>

                    </div>
                    <button
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2 rounded-md text-sm
                            bg-black/5 dark:bg-white/5
                            hover:bg-black/10 dark:hover:bg-white/10
                            border border-black/10 dark:border-white/10
                            flex-shrink-0
                            transition-colors
                            "
                        type="button"
                        onClick={() => setEditModalOpen(true)}
                    >
                        <Edit className="w-5 h-5" />
                        <span className="text-sm">Edit Binder</span>
                    </button>
                    <button
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2 rounded-md text-sm
                            bg-red-500/10 dark:bg-red-500/20
                            hover:bg-red-500/20 dark:hover:bg-red-500/30
                            border border-red-500/30 dark:border-red-500/40
                            text-red-600 dark:text-red-400
                            flex-shrink-0
                            transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        type="button"
                        onClick={async () => {
                            if (!binder || !confirm(`Are you sure you want to delete "${binder.name}"? This action cannot be undone.`)) {
                                return;
                            }
                            setDeleting(true);
                            try {
                                const response = await fetch(`/api/binders/${binder.id}`, {
                                    method: "DELETE",
                                });
                                if (!response.ok) {
                                    throw new Error("Failed to delete binder");
                                }
                                onClose();
                                if (onSuccess) {
                                    onSuccess();
                                }
                            } catch (err) {
                                alert(err instanceof Error ? err.message : "Failed to delete binder");
                            } finally {
                                setDeleting(false);
                            }
                        }}
                        disabled={deleting}
                    >
                        <Trash className="w-5 h-5" />
                        <span className="text-sm">{deleting ? "Deleting..." : "Delete Binder"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
              p-2 rounded-md
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
            "
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Binder Scene */}
                <div className="p-4 sm:p-6">
                    {/* “Table” surface */}
                    <div
                        className="
              relative
              rounded-2xl
              border border-black/10 dark:border-white/10
              bg-[#e8d5b8] dark:bg-[#173c3f]
              p-4 sm:p-6
              overflow-hidden
            "
                    >
                        {/* subtle diagonal texture */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.10]"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)",
                            }}
                        />

                        {/* Binder open layout */}
                        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_70px_1fr] gap-4 lg:gap-6 items-stretch">
                            {/* LEFT COVER */}
                            <div
                                className="
                  relative rounded-2xl
                  border border-black/10 dark:border-white/10
                  shadow-xl
                  overflow-hidden
                  min-h-[260px]
                "
                                style={{ backgroundColor: coverColor }}
                            >
                                {/* cover shine */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 opacity-5"
                                    style={{
                                        background:
                                            "linear-gradient(120deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.10) 100%)",
                                    }}
                                />

                                {/* faux “stitched” edge */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-2xl"
                                    style={{
                                        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.12)",
                                    }}
                                />

                                {/* label plate */}
                                <div className="absolute left-5 top-5 right-5">
                                    <div
                                        className="
                      rounded-xl
                      border border-black/15
                      bg-white/80
                      backdrop-blur
                      px-4 py-3
                      text-[#193f44]
                      shadow-md
                    "
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs uppercase tracking-wider opacity-90">
                                                    DeckHaven Binder
                                                </p>
                                                <p className="text-lg font-semibold truncate">{binder.name}</p>
                                                {binder.description?.trim() ? (
                                                    <p className="text-sm opacity-75 line-clamp-2 mt-0.5">{binder.description}</p>
                                                ) : null}
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RINGS / SPINE */}
                            <div className="relative flex items-center justify-center">
                                <div
                                    className="
                    relative h-full w-full
                    rounded-2xl
                    border border-black/10 dark:border-white/10
                    bg-black/5 dark:bg-white/5
                    overflow-hidden
                  "
                                >
                                    {/* spine highlight */}
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 opacity-40"
                                        style={{
                                            background:
                                                "linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06), rgba(0,0,0,0.10))",
                                        }}
                                    />

                                    {/* inner “hinge” line */}
                                    <div className="absolute inset-y-0 left-1/2 w-px bg-black/15 dark:bg-white/15" />
                                </div>
                            </div>

                            {/* RIGHT PAGE (9-pocket) */}
                            <div
                                className="
                  relative rounded-2xl
                  border border-black/10 dark:border-white/10
                  bg-[#f6ead6] dark:bg-[#0f2a2c]
                  shadow-xl
                  overflow-hidden
                  min-h-[260px]
                "
                            >
                                {/* paper grain */}
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.12]"
                                    style={{
                                        backgroundImage:
                                            "repeating-linear-gradient(0deg, currentColor 0px, transparent 1px, transparent 6px)",
                                    }}
                                />

                                <div className="relative p-4 sm:p-5">
                                    {/* pocket grid */}
                                    <div
                                        className={`grid gap-3 sm:gap-4 ${gridSize.cols === 2 ? "grid-cols-2" :
                                                gridSize.cols === 4 ? "grid-cols-4" :
                                                    "grid-cols-3"
                                            }`}
                                    >
                                        {pageSlots.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className="
                          aspect-[2.5/3.5]
                          rounded-lg
                          border border-black/10 dark:border-white/10
                          bg-black/5 dark:bg-white/5
                          overflow-hidden
                          relative
                          shadow-sm
                        "
                                                title={slot?.title ?? (slot ? "Card" : "Empty slot")}
                                            >
                                                {/* pocket “lip” */}
                                                <div className="absolute inset-x-0 top-0 h-3 bg-white/25 dark:bg-black/20" />

                                                {slot?.imageUrl ? (
                                                    // If/when you have images, this becomes the real card view.
                                                    // You can swap to next/image later if you want optimization.
                                                    <img
                                                        src={slot.imageUrl}
                                                        alt={slot.title ?? "Card"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    // Placeholder card silhouette
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <div
                                                            className="
                                w-[84%] h-[86%]
                                rounded-md
                                border border-black/15 dark:border-white/15
                                bg-white/40 dark:bg-black/15
                                shadow-inner
                                flex items-center justify-center
                              "
                                                        >
                                                            <div className="text-xs opacity-60 px-2 text-center leading-snug">
                                                                {slot ? "Card" : "Empty"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* optional footer hint row */}
                                    <div className="mt-4 flex items-center justify-between text-xs opacity-65">
                                        <span>Page 1</span>
                                        <span>{cards.length} shown • {gridSize.total} slots ({binder.size || "3x3"})</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* bottom shadow to “lift” binder off table */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-10 bottom-4 h-10 blur-2xl opacity-25"
                            style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)" }}
                        />
                    </div>
                </div>
            </div>

            {/* Edit Binder Modal */}
            <EditBinderModal
                open={editModalOpen}
                binder={binder}
                onClose={() => setEditModalOpen(false)}
                onSuccess={() => {
                    setEditModalOpen(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                }}
            />
        </div>
    );
}