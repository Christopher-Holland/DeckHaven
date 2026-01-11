"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ScryfallCard } from "@/app/lib/scryfall";

export type EditableCard = {
    id: string;        // collection item id
    cardId: string;    // scryfall id
    name: string;
    quantity: number;
    condition?: string;
    language?: string;
    notes?: string;
    tags?: string;
    isFoil: boolean;
};

type Props = {
    open: boolean;
    card: EditableCard | null;
    onClose: () => void;
    onSave: (updated: EditableCard) => Promise<void> | void;
};

/**
 * EditCardListModal (Drawer)
 *
 * Same API as before (open/card/onClose/onSave), but rendered as a right-side drawer.
 * Keeping the filename makes it easy to find/edit without chasing imports.
 */
export default function EditCardListModal({ open, card, onClose, onSave }: Props) {
    const [quantity, setQuantity] = useState(0);
    const [isFoil, setIsFoil] = useState(false);
    const [condition, setCondition] = useState("");
    const [language, setLanguage] = useState("en");
    const [tags, setTags] = useState("");
    const [notes, setNotes] = useState("");
    const [cardImage, setCardImage] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);

    // local "saving" UI state (optional, but nice)
    const [saving, setSaving] = useState(false);

    // Fetch card image when card changes
    useEffect(() => {
        if (!open || !card || !card.cardId) {
            setCardImage(null);
            return;
        }

        const cardId = card.cardId; // Capture cardId to avoid null check issues

        async function fetchCardImage() {
            try {
                setLoadingImage(true);
                const response = await fetch(`/api/scryfall/card/${cardId}`);
                if (response.ok) {
                    const cardData: ScryfallCard = await response.json();
                    const imageUrl = cardData.image_uris?.normal || 
                                   cardData.image_uris?.large || 
                                   cardData.image_uris?.small ||
                                   cardData.card_faces?.[0]?.image_uris?.normal ||
                                   null;
                    setCardImage(imageUrl);
                }
            } catch (err) {
                console.warn("Failed to fetch card image:", err);
                setCardImage(null);
            } finally {
                setLoadingImage(false);
            }
        }

        fetchCardImage();
    }, [open, card]);

    // populate fields when opened / card changes
    useEffect(() => {
        if (!open || !card) return;

        setQuantity(card.quantity ?? 0);
        setIsFoil(!!card.isFoil);
        setCondition(card.condition ?? "");
        setLanguage(card.language ?? "en");
        setTags(card.tags ?? "");
        setNotes(card.notes ?? "");
    }, [open, card]);

    // ESC to close
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const safeName = card?.name ?? "Unknown Card";

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <button
                aria-label="Close editor"
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Drawer Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Edit collection item"
                className="
          absolute right-0 top-0 h-full w-full max-w-md
          bg-[#f6ead6] dark:bg-[#0f2a2c]
          text-[#193f44] dark:text-[#e8d5b8]
          border-l border-black/10 dark:border-white/10
          shadow-[-20px_0_60px_-25px_rgba(0,0,0,0.55)]
          flex flex-col
        "
            >
                {/* Header */}
                <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{safeName}</div>
                        <div className="text-xs opacity-70 truncate">MTG</div>
                    </div>

                    <button
                        onClick={onClose}
                        className="
              rounded-md px-3 py-1.5 text-sm font-medium
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              border border-black/10 dark:border-white/10
              transition-colors
            "
                        aria-label="Close"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Card Image */}
                {cardImage && (
                    <div className="px-4 pt-4">
                        <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 flex items-center justify-center">
                            <img
                                src={cardImage}
                                alt={safeName}
                                className="h-[300px] w-auto"
                            />
                        </div>
                    </div>
                )}
                {loadingImage && (
                    <div className="px-4 pt-4">
                        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 aspect-[5/7] flex items-center justify-center">
                            <div className="text-xs opacity-70">Loading image...</div>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="p-4 overflow-y-auto space-y-4">
                    {/* Quantity */}
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Quantity</div>

                        <div className="mt-2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                                className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                –
                            </button>

                            <input
                                type="number"
                                min={0}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                                className="
                  w-24 rounded-md border px-3 py-2 text-sm text-center
                  bg-white/70 dark:bg-white/5
                  border-black/10 dark:border-white/10
                  focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                  dark:focus:ring-[#82664e]
                "
                            />

                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                                className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Foil */}
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                        <label className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Foil</div>
                                <div className="text-xs opacity-70">Mark this entry as foil.</div>
                            </div>

                            <input
                                type="checkbox"
                                checked={isFoil}
                                onChange={(e) => setIsFoil(e.target.checked)}
                                className="h-4 w-4"
                            />
                        </label>
                    </div>

                    {/* Condition + Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Condition</div>
                            <input
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                placeholder="e.g. NM, LP"
                                className="
                  mt-2 w-full rounded-md border px-3 py-2 text-sm
                  bg-white/70 dark:bg-white/5
                  border-black/10 dark:border-white/10
                  focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                  dark:focus:ring-[#82664e]
                "
                            />
                        </div>

                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Language</div>
                            <input
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                placeholder="en"
                                className="
                  mt-2 w-full rounded-md border px-3 py-2 text-sm
                  bg-white/70 dark:bg-white/5
                  border-black/10 dark:border-white/10
                  focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                  dark:focus:ring-[#82664e]
                "
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Tags</div>
                        <div className="text-xs opacity-70 mt-1">Comma-separated (e.g. trade, staple, commander).</div>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="trade, staple"
                            className="
                mt-2 w-full rounded-md border px-3 py-2 text-sm
                bg-white/70 dark:bg-white/5
                border-black/10 dark:border-white/10
                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
              "
                        />
                    </div>

                    {/* Notes */}
                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Notes</div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Optional notes…"
                            className="
                mt-2 w-full rounded-md border px-3 py-2 text-sm
                bg-white/70 dark:bg-white/5
                border-black/10 dark:border-white/10
                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
                resize-none
              "
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="
              rounded-md px-4 py-2 text-sm font-medium
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              border border-black/10 dark:border-white/10
              transition-colors
            "
                    >
                        Cancel
                    </button>

                    <button
                        disabled={saving || !card}
                        onClick={async () => {
                            if (!card) return;

                            const updated: EditableCard = {
                                ...card,
                                quantity: Math.max(0, quantity),
                                isFoil,
                                condition: condition.trim() || undefined,
                                language: language.trim() || undefined,
                                tags: tags.trim() || undefined,
                                notes: notes.trim() || undefined,
                            };

                            try {
                                setSaving(true);
                                await onSave(updated);
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="
              rounded-md px-4 py-2 text-sm font-medium text-white
              bg-[#42c99c] dark:bg-[#82664e]
              hover:opacity-95 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </aside>
        </div>
    );
}