"use client";

import { useState } from "react";
import { useDrawer } from "./drawerProvider";
import type { ScryfallCard } from "@/app/lib/scryfall";

type BinderCardPayload = {
    card: ScryfallCard | null;
    binderCardId: string;
    cardId: string;
    isInCollection: boolean;
    onRemove: () => void | Promise<void>;
    onAddToCollection: () => void | Promise<void>;
    onRemoveFromCollection: () => void | Promise<void>;
};

export function BinderCardDrawer() {
    const { state, close } = useDrawer();
    const payload = state.payload as BinderCardPayload | null;
    const [loading, setLoading] = useState(false);

    if (!payload) return null;

    const { card, isInCollection, onRemove, onAddToCollection, onRemoveFromCollection } = payload;
    if (!card) return null;

    const cardName = card.name || "Unknown Card";
    const gameLabel = "Magic the Gathering"; // All Scryfall cards are MTG
    const imageUrl =
        card.image_uris?.large ||
        card.image_uris?.normal ||
        card.image_uris?.png ||
        card.card_faces?.[0]?.image_uris?.large ||
        card.card_faces?.[0]?.image_uris?.normal ||
        null;

    const handleRemove = async () => {
        setLoading(true);
        try {
            await onRemove();
            close();
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = async () => {
        setLoading(true);
        try {
            await onAddToCollection();
            close();
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCollection = async () => {
        setLoading(true);
        try {
            await onRemoveFromCollection();
            close();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Card name and game */}
            <div>
                <h3 className="text-lg font-semibold truncate">{cardName}</h3>
                <p className="text-sm opacity-70 mt-0.5">{gameLabel}</p>
            </div>

            {/* Large card image */}
            <div className="flex justify-center">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={cardName}
                        className={`max-w-full max-h-[400px] object-contain rounded-lg ${
                            !isInCollection ? "opacity-60 grayscale" : ""
                        }`}
                    />
                ) : (
                    <div
                        className={`w-48 h-64 rounded-lg bg-[var(--theme-sidebar)] flex items-center justify-center ${
                            !isInCollection ? "opacity-60" : ""
                        }`}
                    >
                        <span className="text-sm opacity-60">No image</span>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="mt-auto pt-4 space-y-2">
                {isInCollection ? (
                    <>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={loading}
                            className="
                                w-full px-4 py-3 rounded-md text-sm font-medium
                                bg-red-500/10 dark:bg-red-500/20
                                hover:bg-red-500/20 dark:hover:bg-red-500/30
                                border border-red-500/30 dark:border-red-500/40
                                text-red-600 dark:text-red-400
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-red-500/50
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? "Removing..." : "Remove from Binder"}
                        </button>
                        <button
                            type="button"
                            onClick={handleRemoveFromCollection}
                            disabled={loading}
                            className="
                                w-full px-4 py-3 rounded-md text-sm font-medium
                                bg-[var(--theme-sidebar)]
                                border border-[var(--theme-border)]
                                text-[var(--theme-fg)]
                                hover:opacity-90
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? "Removing..." : "Remove from Collection"}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={handleAddToCollection}
                        disabled={loading}
                        className="
                            w-full px-4 py-3 rounded-md text-sm font-medium
                            bg-[var(--theme-accent)]
                            text-white
                            hover:opacity-95
                            transition-opacity
                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {loading ? "Adding..." : "Add to Collection"}
                    </button>
                )}
            </div>
        </div>
    );
}
