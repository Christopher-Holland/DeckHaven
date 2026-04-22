"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { FORMAT_RULES, type FormatKey, type FormatRules } from "@/app/lib/mtgFormatRules";

type Deck = {
    id: string;
    name: string;
    description: string | null;
    format: string | null;
    game: string;
    deckBoxColor: string | null;
    trimColor: string | null;
};

type EditDeckModalProps = {
    open: boolean;
    deck: Deck | null;
    onClose: () => void;
    onSuccess?: () => Promise<void> | void;
    /** Called after the deck is deleted successfully, before the modal closes (e.g. navigate away). */
    onDeleted?: () => Promise<void> | void;
};

export default function EditDeckModal({
    open,
    deck,
    onClose,
    onSuccess,
    onDeleted,
}: EditDeckModalProps) {
    const [selectedFormat, setSelectedFormat] = useState<FormatKey>("Standard");
    const [deckBoxColor, setDeckBoxColor] = useState<string>("#ffffff");
    const [trimColor, setTrimColor] = useState<string>("#1f2937");
    const [deckName, setDeckName] = useState<string>("");
    const [deckDescription, setDeckDescription] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const busy = saving || deleting;

    // Reset form when modal opens/closes or deck changes
    useEffect(() => {
        if (open && deck) {
            setDeckName(deck.name || "");
            setDeckDescription(deck.description || "");
            setSelectedFormat((deck.format as FormatKey) || "Standard");
            setDeckBoxColor(deck.deckBoxColor || "#ffffff");
            setTrimColor(deck.trimColor || "#1f2937");
            setError(null);
        } else if (!open) {
            setDeckName("");
            setDeckDescription("");
            setSelectedFormat("Standard");
            setDeckBoxColor("#ffffff");
            setTrimColor("#1f2937");
            setError(null);
            setDeleting(false);
        }
    }, [open, deck]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, busy]);

    const rules = useMemo(() => FORMAT_RULES[selectedFormat] as FormatRules, [selectedFormat]);

    if (!open || !deck) return null;

    const handleSubmit = async () => {
        if (!deckName.trim()) {
            setError("Please enter a deck name");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/decks/${deck.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: deckName.trim(),
                    description: deckDescription.trim() || null,
                    format: selectedFormat,
                    deckBoxColor: deckBoxColor,
                    trimColor: trimColor,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to update deck" }));
                throw new Error(errorData.error || "Failed to update deck");
            }

            if (onSuccess) {
                await onSuccess();
            }

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update deck");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (
            !deck ||
            !confirm(
                `Delete "${deck.name}"? All cards in this deck will be removed. This cannot be undone.`
            )
        ) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            const response = await fetch(`/api/decks/${deck.id}`, { method: "DELETE" });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to delete deck" }));
                throw new Error(errorData.error || "Failed to delete deck");
            }

            if (onDeleted) {
                await onDeleted();
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete deck");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                disabled={busy}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edit Deck"
                    className="
                        flex min-h-0 max-h-[min(92dvh,100svh)] w-full max-w-6xl flex-col overflow-hidden
                        rounded-t-2xl border border-b-0 bg-[var(--theme-bg)] border-[var(--theme-border)]
                        text-[var(--theme-fg)] shadow-[0_30px_80px_-35px_rgba(0,0,0,0.60)]
                        sm:rounded-2xl sm:border-b sm:max-h-[90vh]
                    "
                >
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--theme-border)] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">Edit Deck</h3>
                            <p className="text-xs opacity-70 truncate">Update your deck information and appearance.</p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={busy}
                            className="
                                rounded-md px-3 py-1.5 text-sm font-medium
                                bg-[var(--theme-sidebar)]
                                hover:bg-[var(--theme-accent)] hover:text-white
                                border border-[var(--theme-border)]
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            aria-label="Close"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain p-4">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/50 px-4 py-3">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Column 1: Deck Info */}
                            <div className="space-y-4">
                                {/* Deck Name */}
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        Deck Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deckName}
                                        onChange={(e) => setDeckName(e.target.value)}
                                        placeholder="Enter deck name..."
                                        disabled={busy}
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-[var(--theme-sidebar)]
                                            border-[var(--theme-border)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                    />
                                </div>

                                {/* Deck Description */}
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={deckDescription}
                                        onChange={(e) => setDeckDescription(e.target.value)}
                                        placeholder="Enter deck description..."
                                        rows={3}
                                        disabled={busy}
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-[var(--theme-sidebar)]
                                            border-[var(--theme-border)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                            resize-none
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                    />
                                </div>

                                {/* Format picker */}
                                <div>
                                    <label className="block text-xs font-medium opacity-80 mb-1">
                                        Format
                                    </label>
                                    <select
                                        value={selectedFormat}
                                        onChange={(e) => setSelectedFormat(e.target.value as FormatKey)}
                                        disabled={busy}
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-[var(--theme-sidebar)]
                                            border-[var(--theme-border)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                    >
                                        {Object.keys(FORMAT_RULES).map((k) => (
                                            <option key={k} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <div className="text-xs font-medium opacity-80 mb-1">Category</div>
                                    <div
                                        className="
                                            rounded-md border px-3 py-2 text-sm
                                            bg-[var(--theme-sidebar)]
                                            border-[var(--theme-border)]
                                        "
                                    >
                                        {rules.category}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Rules */}
                            <div className="space-y-4">
                                {/* Rules summary */}
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-3">
                                        Format Rules
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <RuleCard label="Deck size" value={rules.deckSize} />
                                        <RuleCard label="Sideboard" value={rules.sideboard} />
                                        <RuleCard label="Copies" value={rules.copies} />
                                        <RuleCard
                                            label="Flags"
                                            value={[
                                                rules.singleton ? "Singleton" : null,
                                                rules.hasCommander ? "Has Commander" : null,
                                                rules.restrictedListPossible ? "Restricted list possible" : null,
                                            ]
                                                .filter(Boolean)
                                                .join(" • ") || "—"}
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                {rules.notes && rules.notes.length > 0 ? (
                                    <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                                            Notes
                                        </div>
                                        <ul className="mt-2 list-disc pl-5 text-sm opacity-80 space-y-1">
                                            {rules.notes.map((n: string) => (
                                                <li key={n}>{n}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>

                            {/* Column 3: Appearance */}
                            <div className="space-y-4">
                                <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
                                    <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-3">
                                        Appearance
                                    </div>

                                    <div className="space-y-3">
                                        {/* Deck Box Color */}
                                        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-sidebar)] px-3 py-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-medium opacity-80">Deck Box</div>
                                                <div className="text-xs opacity-60 truncate">{deckBoxColor}</div>
                                            </div>

                                            <input
                                                aria-label="Deck box color"
                                                type="color"
                                                value={deckBoxColor}
                                                onChange={(e) => setDeckBoxColor(e.target.value)}
                                                disabled={busy}
                                                className="
                                                    h-7 w-7 rounded-md
                                                    border border-[var(--theme-border)]
                                                    overflow-hidden cursor-pointer
                                                    bg-transparent p-0
                                                    disabled:opacity-50 disabled:cursor-not-allowed

                                                    [appearance:none]
                                                    [&::-webkit-color-swatch-wrapper]:p-0
                                                    [&::-webkit-color-swatch]:border-0
                                                    [&::-webkit-color-swatch]:rounded-md
                                                    [&::-moz-color-swatch]:border-0
                                                    [&::-moz-color-swatch]:rounded-md
                                                "
                                            />
                                        </div>

                                        {/* Trim Color */}
                                        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-sidebar)] px-3 py-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-medium opacity-80">Trim</div>
                                                <div className="text-xs opacity-60 truncate">{trimColor}</div>
                                            </div>

                                            <div className="flex items-center gap-2">

                                                <input
                                                    aria-label="Trim color"
                                                    type="color"
                                                    value={trimColor}
                                                    onChange={(e) => setTrimColor(e.target.value)}
                                                    disabled={busy}
                                                    className="
                                                    h-7 w-7 rounded-md
                                                    border border-[var(--theme-border)]
                                                    overflow-hidden cursor-pointer
                                                    bg-transparent p-0
                                                    disabled:opacity-50 disabled:cursor-not-allowed

                                                    [appearance:none]
                                                    [&::-webkit-color-swatch-wrapper]:p-0
                                                    [&::-webkit-color-swatch]:border-0
                                                    [&::-webkit-color-swatch]:rounded-md
                                                    [&::-moz-color-swatch]:border-0
                                                    [&::-moz-color-swatch]:rounded-md
                                                "
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick presets */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[
                                            { label: "Verdant Sigil", box: "#f6ead6", trim: "#42c99c" },
                                            { label: "Midnight Reliquary", box: "#0f2a2c", trim: "#e8d5b8" },
                                            { label: "Obsidian Archive", box: "#1f2937", trim: "#94a3b8" },
                                            { label: "Ivory Codex", box: "#fff7ed", trim: "#82664e" },
                                            { label: "Blood Oath", box: "#7a1f2b", trim: "#c9a24d" },
                                            { label: "Arcane Steel", box: "#2b3440", trim: "#3b82f6" },
                                        ].map((p) => (
                                            <button
                                                key={p.label}
                                                type="button"
                                                onClick={() => {
                                                    setDeckBoxColor(p.box);
                                                    setTrimColor(p.trim);
                                                }}
                                                disabled={busy}
                                                className="
                                                    inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium
                                                    border border-[var(--theme-border)]
                                                    bg-[var(--theme-sidebar)]
                                                    hover:bg-[var(--theme-accent)]/20
                                                    transition-colors
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                "
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <span
                                                        className="h-3 w-3 rounded-sm border border-[var(--theme-border)]"
                                                        style={{ backgroundColor: p.box }}
                                                        aria-hidden
                                                    />
                                                    <span
                                                        className="h-3 w-3 rounded-sm border border-[var(--theme-border)]"
                                                        style={{ backgroundColor: p.trim }}
                                                        aria-hidden
                                                    />
                                                </span>
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tiny preview strip */}
                                    <div className="mt-3 rounded-lg border border-[var(--theme-border)] overflow-hidden">
                                        <div className="h-10" style={{ backgroundColor: deckBoxColor }} />
                                        <div className="h-2" style={{ backgroundColor: trimColor }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--theme-border)] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={busy}
                            className="
                                inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium
                                bg-red-500/10 dark:bg-red-500/20
                                hover:bg-red-500/20 dark:hover:bg-red-500/30
                                border border-red-500/30 dark:border-red-500/40
                                text-red-600 dark:text-red-400
                                transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                                sm:min-h-0 sm:w-auto
                            "
                        >
                            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                            {deleting ? "Deleting..." : "Delete Deck"}
                        </button>

                        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={busy}
                                className="
                                    min-h-[44px] w-full rounded-md px-4 py-2 text-sm font-medium
                                    bg-[var(--theme-sidebar)]
                                    hover:opacity-90
                                    border border-[var(--theme-border)]
                                    transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    sm:min-h-0 sm:w-auto
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!deckName.trim() || busy}
                                className="
                                    min-h-[44px] w-full rounded-md px-4 py-2 text-sm font-medium text-white
                                    bg-[var(--theme-accent)]
                                    hover:opacity-95 transition-opacity
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    sm:min-h-0 sm:w-auto
                                "
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RuleCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-sidebar)] p-4">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {label}
            </div>
            <div className="mt-1 text-sm opacity-90">{value}</div>
        </div>
    );
}

