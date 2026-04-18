"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ScryfallCard } from "@/app/lib/scryfall";
import SelectDeckModal from "@/app/sets/[setId]/selectDeckModal";
import SelectBinderModal from "@/app/sets/[setId]/selectBinderModal";
import { useToast } from "@/app/components/ToastContext";

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
type DeckInfo = {
    id: string;
    name: string;
};

type BinderInfo = {
    id: string;
    name: string;
};

export default function EditCardListModal({ open, card, onClose, onSave }: Props) {
    const router = useRouter();
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState(0);
    const [isFoil, setIsFoil] = useState(false);
    const [condition, setCondition] = useState("");
    const [language, setLanguage] = useState("en");
    const [tags, setTags] = useState("");
    const [notes, setNotes] = useState("");
    const [cardImage, setCardImage] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);
    const [decksWithCard, setDecksWithCard] = useState<DeckInfo[]>([]);
    const [bindersWithCard, setBindersWithCard] = useState<BinderInfo[]>([]);
    const [loadingDecks, setLoadingDecks] = useState(false);
    const [loadingBinders, setLoadingBinders] = useState(false);
    const [selectDeckOpen, setSelectDeckOpen] = useState(false);
    const [selectBinderOpen, setSelectBinderOpen] = useState(false);

    // local "saving" UI state (optional, but nice)
    const [saving, setSaving] = useState(false);

    const loadContainingDecksAndBinders = useCallback(async (cardId: string) => {
        try {
            setLoadingDecks(true);
            const decksResponse = await fetch("/api/decks");
            if (decksResponse.ok) {
                const decksData = await decksResponse.json();
                const decksContainingCard: DeckInfo[] = [];
                for (const deck of decksData.decks || []) {
                    try {
                        const deckDetailResponse = await fetch(`/api/decks/${deck.id}`);
                        if (deckDetailResponse.ok) {
                            const deckDetail = await deckDetailResponse.json();
                            const hasCard = (deckDetail.deck?.deckCards || []).some(
                                (dc: { cardId: string }) => dc.cardId === cardId
                            );
                            if (hasCard) {
                                decksContainingCard.push({ id: deck.id, name: deck.name });
                            }
                        }
                    } catch {
                        // Failed to fetch deck
                    }
                }
                setDecksWithCard(decksContainingCard);
            }
        } catch {
            // Failed to fetch decks
        } finally {
            setLoadingDecks(false);
        }

        try {
            setLoadingBinders(true);
            const bindersResponse = await fetch("/api/binders");
            if (bindersResponse.ok) {
                const bindersData = await bindersResponse.json();
                const bindersContainingCard: BinderInfo[] = (bindersData.binders || [])
                    .filter((binder: { binderCards: Array<{ cardId: string }> }) =>
                        binder.binderCards?.some((bc: { cardId: string }) => bc.cardId === cardId)
                    )
                    .map((binder: { id: string; name: string }) => ({
                        id: binder.id,
                        name: binder.name,
                    }));
                setBindersWithCard(bindersContainingCard);
            }
        } catch {
            // Failed to fetch binders
        } finally {
            setLoadingBinders(false);
        }
    }, []);

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
                setCardImage(null);
            } finally {
                setLoadingImage(false);
            }
        }

        fetchCardImage();
    }, [open, card]);

    // Fetch decks and binders containing this card
    useEffect(() => {
        if (!open || !card || !card.cardId) {
            setDecksWithCard([]);
            setBindersWithCard([]);
            return;
        }

        loadContainingDecksAndBinders(card.cardId);
    }, [open, card, loadContainingDecksAndBinders]);

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

    // Avoid reopening deck/binder pickers when the drawer is opened again
    useEffect(() => {
        if (!open) {
            setSelectDeckOpen(false);
            setSelectBinderOpen(false);
        }
    }, [open]);

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
          absolute right-0 top-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col
          border-l border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-fg)]
          shadow-[-20px_0_60px_-25px_rgba(0,0,0,0.55)]
          min-h-0 pt-[env(safe-area-inset-top)]
        "
            >
                {/* Header */}
                <div className="p-4 border-b border-[var(--theme-border)] flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{safeName}</div>
                        <div className="text-xs opacity-70 truncate">MTG</div>
                    </div>

                    <button
                        onClick={onClose}
                        className="
              rounded-md px-3 py-1.5 text-sm font-medium
              bg-[var(--theme-sidebar)]
              hover:opacity-90
              border border-[var(--theme-border)]
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
                        <div className="rounded-lg overflow-hidden border border-[var(--theme-border)] flex items-center justify-center">
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
                        <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-sidebar)] aspect-[5/7] flex items-center justify-center">
                            <div className="text-xs opacity-70">Loading image...</div>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] touch-pan-y">
                    {/* Quantity */}
                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Quantity</div>

                        <div className="mt-2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                                className="px-3 py-2 rounded-md bg-[var(--theme-sidebar)] hover:opacity-90 border border-[var(--theme-border)] transition-colors"
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
                  bg-[var(--theme-sidebar)]
                  border-[var(--theme-border)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                "
                            />

                            <button
                                type="button"
                                onClick={() => setQuantity((q) => q + 1)}
                                className="px-3 py-2 rounded-md bg-[var(--theme-sidebar)] hover:opacity-90 border border-[var(--theme-border)] transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Add to deck / binder (same modals as set page) */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectDeckOpen(true)}
                            disabled={!card?.cardId}
                            className="
                                px-3 py-2 rounded-md text-sm font-medium
                                border border-[var(--theme-border)]
                                bg-[var(--theme-sidebar)]
                                text-[var(--theme-fg)]
                                hover:bg-[var(--theme-accent)] hover:text-white
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Add to deck
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectBinderOpen(true)}
                            disabled={!card?.cardId}
                            className="
                                px-3 py-2 rounded-md text-sm font-medium
                                border border-[var(--theme-border)]
                                bg-[var(--theme-sidebar)]
                                text-[var(--theme-fg)]
                                hover:bg-[var(--theme-accent)] hover:text-white
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Add to binder
                        </button>
                    </div>

                    {/* Foil */}
                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
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
                        <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Condition</div>
                            <input
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                placeholder="e.g. NM, LP"
                                className="
                  mt-2 w-full rounded-md border px-3 py-2 text-sm
                  bg-[var(--theme-sidebar)]
                  border-[var(--theme-border)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                "
                            />
                        </div>

                        <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Language</div>
                            <input
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                placeholder="en"
                                className="
                  mt-2 w-full rounded-md border px-3 py-2 text-sm
                  bg-[var(--theme-sidebar)]
                  border-[var(--theme-border)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                "
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Tags</div>
                        <div className="text-xs opacity-70 mt-1">Comma-separated (e.g. trade, staple, commander).</div>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="trade, staple"
                            className="
                mt-2 w-full rounded-md border px-3 py-2 text-sm
                bg-[var(--theme-sidebar)]
                border-[var(--theme-border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
              "
                        />
                    </div>

                    {/* Notes */}
                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Notes</div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Optional notes…"
                            className="
                mt-2 w-full rounded-md border px-3 py-2 text-sm
                bg-[var(--theme-sidebar)]
                border-[var(--theme-border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                resize-none
              "
                        />
                    </div>

                    {/* Decks Section */}
                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
                            In Decks
                        </div>
                        {loadingDecks ? (
                            <div className="text-xs opacity-70">Loading...</div>
                        ) : decksWithCard.length > 0 ? (
                            <div className="space-y-1">
                                {decksWithCard.map((deck) => (
                                    <button
                                        key={deck.id}
                                        onClick={() => {
                                            router.push(`/decks/${deck.id}`);
                                            onClose();
                                        }}
                                        className="
                                            w-full text-left text-xs px-2 py-1 rounded
                                            hover:bg-[var(--theme-sidebar)]
                                            transition-colors
                                            truncate
                                        "
                                    >
                                        {deck.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs opacity-70">Not in any decks</div>
                        )}
                    </div>

                    {/* Binders Section */}
                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
                            In Binders
                        </div>
                        {loadingBinders ? (
                            <div className="text-xs opacity-70">Loading...</div>
                        ) : bindersWithCard.length > 0 ? (
                            <div className="space-y-1">
                                {bindersWithCard.map((binder) => (
                                    <button
                                        key={binder.id}
                                        onClick={() => {
                                            router.push(`/collection/binders/${binder.id}`);
                                            onClose();
                                        }}
                                        className="
                                            w-full text-left text-xs px-2 py-1 rounded
                                            hover:bg-[var(--theme-sidebar)]
                                            transition-colors
                                            truncate
                                        "
                                    >
                                        {binder.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs opacity-70">Not in any binders</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--theme-border)] flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="
              rounded-md px-4 py-2 text-sm font-medium
              bg-[var(--theme-sidebar)]
              hover:opacity-90
              border border-[var(--theme-border)]
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
              bg-[var(--theme-accent)]
              hover:opacity-95 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </aside>

            <SelectDeckModal
                open={selectDeckOpen}
                cardId={card?.cardId || ""}
                onClose={() => setSelectDeckOpen(false)}
                onSelect={async (deckId: string, qty: number) => {
                    if (!card?.cardId) return;

                    const response = await fetch(`/api/decks/${deckId}/cards`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            cardId: card.cardId,
                            quantity: qty,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: "Failed to add card to deck" }));
                        throw new Error(errorData.error || "Failed to add card to deck");
                    }

                    showToast(
                        `Added ${qty} card${qty === 1 ? "" : "s"} to deck.`,
                        "success"
                    );
                    await loadContainingDecksAndBinders(card.cardId);
                }}
            />

            <SelectBinderModal
                open={selectBinderOpen}
                cardId={card?.cardId || ""}
                onClose={() => setSelectBinderOpen(false)}
                onSelect={async (binderId: string, qty: number) => {
                    if (!card?.cardId) return;

                    for (let i = 0; i < qty; i++) {
                        const response = await fetch(`/api/binders/${binderId}/cards`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                cardId: card.cardId,
                                slotNumber: null,
                            }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ error: "Failed to add card to binder" }));
                            throw new Error(errorData.error || "Failed to add card to binder");
                        }
                    }

                    const total = qty;
                    showToast(
                        `Added ${total} card${total === 1 ? "" : "s"} to binder.`,
                        "success"
                    );
                    await loadContainingDecksAndBinders(card.cardId);
                }}
            />
        </div>
    );
}