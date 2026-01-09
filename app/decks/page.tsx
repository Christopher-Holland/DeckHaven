/**
 * Decks Page
 * 
 * Displays the user's decks in a grid format. Allows for creating, viewing, and managing decks.
 * 
 * @page
 * @route /decks
 */

"use client";

import { useState } from "react";
import CreateDeckModal from "../decks/createDeckModal";

type DeckBoxProps = {
    title?: string;
    subtitle?: string;
    onClick?: () => void;
};

function DeckBox({
    title = "Mono Black Vampires",
    subtitle = "Commander • 100 cards",
    onClick,
}: DeckBoxProps) {
    return (
        <div
            className="group relative w-full deck-box-container"
            style={{ perspective: "1200px" }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                    .deck-box-container .deck-box-lid {
                        transform: translateY(0px) rotateX(0deg);
                    }
                    .deck-box-container:hover .deck-box-lid {
                        transform: translateY(-2px) rotateX(105deg);
                    }
                `
            }} />
            {/* Click target */}
            <button
                type="button"
                onClick={onClick}
                className="relative w-full text-left"
            >
                {/* Box body */}
                <div
                    className={[
                        "relative rounded-2xl border min-h-[280px]",
                        "bg-white/90 dark:bg-[#113033]/90",
                        "border-black/10 dark:border-white/10",
                        "shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]",
                        "transition-transform duration-300 ease-out",
                        "group-hover:-translate-y-1",
                    ].join(" ")}
                >
                    {/* Inner cavity (becomes visible when lid opens) */}
                    <div
                        className={[
                            "absolute inset-3 rounded-xl",
                            "bg-black/5 dark:bg-black/30",
                            "shadow-[inset_0_10px_18px_rgba(0,0,0,0.25)]",
                            "transition-opacity duration-300",
                            "opacity-0 group-hover:opacity-100",
                        ].join(" ")}
                    />

                    {/* Content area */}
                    <div className="relative p-5 pt-24">

                        {/* Faux "front label plate" */}
                        <div
                            className={[
                                "mt-5 rounded-xl border px-4 py-3",
                                "border-black/10 dark:border-white/10",
                                "bg-white/70 dark:bg-white/5",
                                "shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
                            ].join(" ")}
                        >
                            <div className="text-sm uppercase tracking-wide opacity-70">
                                Deck ID: DH-001
                            </div>
                            <div className="mt-1 text-lg font-semibold opacity-80">
                                {title}
                            </div>
                            <div className="mt-1 text-sm opacity-80">
                                {subtitle}
                            </div>
                        </div>
                    </div>

                    {/* Front "thickness" lip */}
                    <div
                        className={[
                            "pointer-events-none absolute left-0 right-0 bottom-0 h-3",
                            "rounded-b-2xl",
                            "bg-black/10 dark:bg-black/35",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
                        ].join(" ")}
                    />
                </div>

                {/* Lid (hinged at back edge) */}
                <div
                    className={[
                        "deck-box-lid",
                        "absolute left-0 right-0 top-0 h-20",
                        "rounded-t-2xl border",
                        "border-black/10 dark:border-white/10",
                        "bg-white dark:bg-[#0f2a2c]",
                        "shadow-[0_14px_30px_-16px_rgba(0,0,0,0.55)]",
                        "origin-[50%_100%]", // hinge at bottom of lid
                        "transition-transform duration-500 ease-[cubic-bezier(.2,.9,.2,1)]",
                    ].join(" ")}
                    style={{
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Lid underside (shows when open) */}
                    <div
                        className="absolute inset-0 rounded-t-2xl"
                        style={{
                            transform: "translateZ(-1px)",
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.00))",
                        }}
                    />

                    {/* Lid highlight strip */}
                    <div className="absolute inset-x-4 top-4 h-2 rounded-full bg-black/5 dark:bg-white/10" />

                    {/* Little notch */}
                    <div className="absolute left-1/2 bottom-2 h-2 w-10 -translate-x-1/2 rounded-full bg-black/10 dark:bg-black/40" />
                </div>
            </button>
        </div>
    );
}

export default function DecksPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // TODO: Fetch decks from API
    const decks = [
        { id: "1", title: "Mono Black Vampires", subtitle: "Commander • 100 cards" },
        { id: "2", title: "Red Deck Wins", subtitle: "Standard • 60 cards" },
    ];

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
                    <h2 className="text-2xl font-semibold">Decks</h2>
                    <p className="text-sm opacity-70 mt-1">Create and manage your deck builds.</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="
                            px-3 py-1.5 rounded-md text-sm font-medium
                            bg-black/5 dark:bg-white/5
                            border border-[#42c99c] dark:border-[#82664e]
                            hover:bg-black/10 dark:hover:bg-white/10
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                        "
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create Deck
                    </button>
                </div>
            </section>

            {/* Decks Grid */}
            {decks.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {decks.map((deck) => (
                        <DeckBox
                            key={deck.id}
                            title={deck.title}
                            subtitle={deck.subtitle}
                            onClick={() => {
                                // TODO: Navigate to deck detail page
                                console.log("Navigate to deck:", deck.id);
                            }}
                        />
                    ))}
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
                        No decks yet. Create your first deck to get started!
                    </p>
                    <button
                        className="
                            px-4 py-2 rounded-md text-sm font-medium
                            bg-[#42c99c] dark:bg-[#82664e] text-white
                            hover:opacity-95 transition-opacity
                        "
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create Deck
                    </button>
                </section>
            )}

            {/* Create Deck Modal - TODO: Implement modal */}
            {isCreateModalOpen && (
                <CreateDeckModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            )}
        </main>
    );
}