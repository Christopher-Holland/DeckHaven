"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { useDrawer } from "./drawerProvider";
import type { ScryfallCard } from "@/app/lib/scryfall";

const BASIC_LANDS = ["Plains", "Island", "Swamp", "Mountain", "Forest"];

type DeckCardPayload = {
    card: ScryfallCard | null;
    deckCardId: string;
    cardId: string;
    quantity: number;
    isSingletonFormat: boolean;
    onQuantityChange: (newQuantity: number) => void | Promise<void>;
    onRemove: () => void | Promise<void>;
};

export function DeckCardDrawer() {
    const { state, close } = useDrawer();
    const payload = state.payload as DeckCardPayload | null;
    const [loading, setLoading] = useState(false);
    const [localQuantity, setLocalQuantity] = useState(payload?.quantity ?? 0);

    // Sync local quantity when drawer opens with a different card
    useEffect(() => {
        if (payload) setLocalQuantity(payload.quantity);
    }, [payload?.deckCardId]);

    if (!payload) return null;

    const { card, isSingletonFormat, onQuantityChange, onRemove } = payload;
    if (!card) return null;

    const cardName = card.name || "Unknown Card";
    const isBasicLand = BASIC_LANDS.includes(cardName);
    const maxQuantity = isBasicLand ? 99 : 4;
    const canDecrease = localQuantity > 1;
    const canIncrease = localQuantity < maxQuantity;

    const gameLabel = "Magic the Gathering";
    const imageUrl =
        card.image_uris?.large ||
        card.image_uris?.normal ||
        card.image_uris?.png ||
        card.card_faces?.[0]?.image_uris?.large ||
        card.card_faces?.[0]?.image_uris?.normal ||
        null;

    const handleQuantityChange = async (newQty: number) => {
        const prevQty = localQuantity;
        setLocalQuantity(newQty);
        setLoading(true);
        try {
            await onQuantityChange(newQty);
            if (newQty === 0) close();
        } catch {
            setLocalQuantity(prevQty);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            await onRemove();
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

            {/* Large card image - match binder drawer size */}
            <div className="flex justify-center">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={cardName}
                        className="max-w-full max-h-[400px] object-contain rounded-lg"
                    />
                ) : (
                    <div className="w-48 h-64 rounded-lg bg-[var(--theme-sidebar)] flex items-center justify-center">
                        <span className="text-sm opacity-60">No image</span>
                    </div>
                )}
            </div>

            {/* Quantity control - +/- like sets/collection pages */}
            <div className="space-y-2">
                <p className="text-sm opacity-80">In deck</p>
                {!isSingletonFormat ? (
                    <div
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2
                            rounded-md
                            bg-[var(--theme-sidebar)]
                            border border-[var(--theme-border)]
                        "
                        aria-label="Adjust quantity"
                    >
                        <button
                            type="button"
                            onClick={() => canDecrease && handleQuantityChange(localQuantity - 1)}
                            disabled={!canDecrease || loading}
                            className="
                                p-1.5 rounded-md
                                border border-[var(--theme-border)]
                                hover:bg-black/10 dark:hover:bg-white/10
                                disabled:opacity-40 disabled:cursor-not-allowed
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                            "
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-semibold">
                            {localQuantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => canIncrease && handleQuantityChange(localQuantity + 1)}
                            disabled={!canIncrease || loading}
                            className="
                                p-1.5 rounded-md
                                border border-[var(--theme-border)]
                                hover:bg-black/10 dark:hover:bg-white/10
                                disabled:opacity-40 disabled:cursor-not-allowed
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                            "
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <p className="text-sm font-semibold">x{localQuantity}</p>
                )}
            </div>

            {/* Remove from deck */}
            <div className="mt-auto pt-4">
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
                    {loading ? "Removing..." : "Remove from Deck"}
                </button>
            </div>
        </div>
    );
}
