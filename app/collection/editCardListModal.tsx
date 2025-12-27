"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type EditableCard = {
    id: string;
    name: string;
    cardId: string; // Scryfall card ID for API calls

    // editable fields
    quantity: number;
    condition?: string;
    language?: string;
    notes?: string;
    isFoil?: boolean;
    tags?: string;
};

type Props = {
    open: boolean;
    card: EditableCard | null;
    onClose: () => void;
    onSave: (updated: EditableCard) => void;
};

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"];
const LANGUAGES = ["EN", "JP", "KR", "DE", "FR", "ES", "IT", "PT"];

export default function EditCardListModal({ open, card, onClose, onSave }: Props) {
    const [draft, setDraft] = useState<EditableCard | null>(card);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // keep draft in sync when opening a different card
    useEffect(() => {
        if (open) {
            setDraft(card);
            setSaveError(null);
        }
    }, [open, card]);

    // Escape to close
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open || !draft) return null;

    const saveDisabled = draft.quantity < 0;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-label="Edit card"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onMouseDown={onClose}
            />

            {/* Modal */}
            <div
                className="
          relative w-[min(560px,92vw)]
          rounded-xl
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#f6ead6] dark:bg-[#0f2a2c]
          text-[#193f44] dark:text-[#e8d5b8]
          shadow-xl
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 border-b border-black/10 dark:border-white/10">
                    <div>
                        <h3 className="text-lg font-semibold">Edit</h3>
                        <p className="text-sm opacity-70">{draft.name}</p>
                    </div>

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
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                    {/* First Row: Quantity and Condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Quantity */}
                        <label className="text-sm">
                            <span className="opacity-80">Quantity</span>
                            <input
                                type="number"
                                min={0}
                                value={draft.quantity}
                                onChange={(e) =>
                                    setDraft((d) =>
                                        d ? { ...d, quantity: Number(e.target.value) } : d
                                    )
                                }
                                className="
                    mt-1 w-full rounded-md px-3 py-2 text-sm
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                  "
                            />
                        </label>

                        {/* Condition */}
                        <label className="text-sm">
                            <span className="opacity-80">Condition</span>
                            <select
                                value={draft.condition ?? "NM"}
                                onChange={(e) =>
                                    setDraft((d) => (d ? { ...d, condition: e.target.value } : d))
                                }
                                className="
                    mt-1 w-full rounded-md px-3 py-2 text-sm
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                  "
                            >
                                {CONDITIONS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Second Row: Language and Foil */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Language */}
                        <label className="text-sm">
                            <span className="opacity-80">Language</span>
                            <select
                                value={draft.language ?? "EN"}
                                onChange={(e) =>
                                    setDraft((d) => (d ? { ...d, language: e.target.value } : d))
                                }
                                className="
                    mt-1 w-full rounded-md px-3 py-2 text-sm
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                  "
                            >
                                {LANGUAGES.map((l) => (
                                    <option key={l} value={l}>
                                        {l}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Foil */}
                        <label className="text-sm flex flex-col">
                            <span className="opacity-80 mb-1">Foil</span>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    checked={draft.isFoil ?? false}
                                    onChange={(e) =>
                                        setDraft((d) => (d ? { ...d, isFoil: e.target.checked } : d))
                                    }
                                    className="
                        w-4 h-4 rounded
                        border border-[#42c99c] dark:border-[#82664e]
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                      "
                                />
                                <span className="text-sm opacity-70">
                                    {draft.isFoil ? "Foil" : "Non-Foil"}
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Tags */}
                    <label className="text-sm">
                        <span className="opacity-80">Tags</span>
                        <input
                            value={draft.tags ?? ""}
                            onChange={(e) =>
                                setDraft((d) => (d ? { ...d, tags: e.target.value } : d))
                            }
                            placeholder="e.g. Trades, Favorites, Set Binder..."
                            className="
                mt-1 w-full rounded-md px-3 py-2 text-sm
                bg-[#e8d5b8] dark:bg-[#173c3f]
                border border-[#42c99c] dark:border-[#82664e]
                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
              "
                        />
                    </label>

                    {/* Notes */}
                    <label className="text-sm">
                        <span className="opacity-80">Notes</span>
                        <textarea
                            value={draft.notes ?? ""}
                            onChange={(e) =>
                                setDraft((d) => (d ? { ...d, notes: e.target.value } : d))
                            }
                            rows={3}
                            placeholder="Optional notes..."
                            className="
                mt-1 w-full rounded-md px-3 py-2 text-sm
                bg-[#e8d5b8] dark:bg-[#173c3f]
                border border-[#42c99c] dark:border-[#82664e]
                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
                resize-none
              "
                        />
                    </label>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-black/10 dark:border-white/10">
                    {saveError && (
                        <div className="mb-3 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                            {saveError}
                        </div>
                    )}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="
              px-3 py-2 rounded-md text-sm
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
            "
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={saveDisabled || saving}
                            onClick={async () => {
                                setSaving(true);
                                setSaveError(null);
                                try {
                                    await onSave(draft);
                                    // onSave will close the modal on success, so we don't need to do anything here
                                    // If we get here without error, the save was successful
                                } catch (err) {
                                    setSaveError(err instanceof Error ? err.message : "Failed to save card");
                                    setSaving(false);
                                    // Don't close modal on error - let user see the error and try again
                                }
                            }}
                            className="
              px-3 py-2 rounded-md text-sm font-medium
              bg-[#42c99c] dark:bg-[#82664e]
              text-white
              hover:opacity-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-opacity
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
              flex items-center gap-2
            "
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}