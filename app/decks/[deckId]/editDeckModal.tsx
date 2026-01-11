"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

type FormatKey =
    | "Standard"
    | "Pioneer"
    | "Modern"
    | "Legacy"
    | "Vintage"
    | "Pauper"
    | "Commander"
    | "Brawl"
    | "Historic Brawl"
    | "Oathbreaker"
    | "Draft"
    | "Sealed"
    | "Two-Headed Giant"
    | "Planechase"
    | "Archenemy";

type FormatRules = {
    name: FormatKey;
    category: "Constructed" | "Commander-style" | "Limited" | "Variant";
    deckSize: string;
    minCards?: number;
    maxCards?: number;
    exactCards?: number;
    sideboard: "Up to 15" | "All unused cards" | "Depends on underlying format" | "None/Not typical";
    copies: string;
    notes?: string[];
    singleton?: boolean;
    hasCommander?: boolean;
    restrictedListPossible?: boolean;
};

const FORMAT_RULES: Record<FormatKey, FormatRules> = {
    Standard: {
        name: "Standard",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands)",
        notes: ["Rotating format (card pool changes over time)."],
    },
    Pioneer: {
        name: "Pioneer",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands)",
    },
    Modern: {
        name: "Modern",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands)",
    },
    Legacy: {
        name: "Legacy",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands); banned list applies",
        notes: ["Some formats have a restricted list—Vintage is the main one."],
    },
    Vintage: {
        name: "Vintage",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands); some cards restricted to 1",
        restrictedListPossible: true,
    },
    Pauper: {
        name: "Pauper",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands)",
        notes: ["Card pool restriction: commons only (per format legality)."],
    },
    Commander: {
        name: "Commander",
        category: "Commander-style",
        deckSize: "Exactly 100 cards (including Commander)",
        exactCards: 100,
        sideboard: "None/Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: true,
        notes: ["Includes 1 Commander.", "Commander color identity rules apply."],
    },
    Brawl: {
        name: "Brawl",
        category: "Commander-style",
        deckSize: "60 cards (including Commander)",
        exactCards: 60,
        sideboard: "None/Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: true,
        notes: ["Uses a Standard-legal card pool (in paper)."],
    },
    "Historic Brawl": {
        name: "Historic Brawl",
        category: "Commander-style",
        deckSize: "100 cards (including Commander)",
        exactCards: 100,
        sideboard: "None/Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: true,
        notes: ["Arena format (digital)."],
    },
    Oathbreaker: {
        name: "Oathbreaker",
        category: "Commander-style",
        deckSize: "60 cards (includes Oathbreaker + Signature Spell)",
        exactCards: 60,
        sideboard: "None/Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        notes: ["Includes 1 Oathbreaker (a planeswalker) + 1 Signature Spell."],
    },
    Draft: {
        name: "Draft",
        category: "Limited",
        deckSize: "40 cards minimum",
        minCards: 40,
        sideboard: "All unused cards",
        copies: "No copy limit (you can play any number you drafted)",
        notes: ["Built during the event from drafted cards."],
    },
    Sealed: {
        name: "Sealed",
        category: "Limited",
        deckSize: "40 cards minimum",
        minCards: 40,
        sideboard: "All unused cards",
        copies: "No copy limit (any number from your sealed pool)",
        notes: ["Built during the event from your sealed pool."],
    },
    "Two-Headed Giant": {
        name: "Two-Headed Giant",
        category: "Variant",
        deckSize: "Depends on underlying format (often 60+ Constructed or 40+ Limited)",
        sideboard: "Depends on underlying format",
        copies: "Depends on underlying format",
        notes: ["Team format—deck rules come from the format being played."],
    },
    Planechase: {
        name: "Planechase",
        category: "Variant",
        deckSize: "Uses underlying format rules",
        sideboard: "Depends on underlying format",
        copies: "Depends on underlying format",
        notes: ["Planes deck is separate from your main deck."],
    },
    Archenemy: {
        name: "Archenemy",
        category: "Variant",
        deckSize: "Uses underlying format rules",
        sideboard: "Depends on underlying format",
        copies: "Depends on underlying format",
        notes: ["Scheme deck is separate from your main deck."],
    },
};

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
};

export default function EditDeckModal({
    open,
    deck,
    onClose,
    onSuccess,
}: EditDeckModalProps) {
    const [selectedFormat, setSelectedFormat] = useState<FormatKey>("Standard");
    const [deckBoxColor, setDeckBoxColor] = useState<string>("#ffffff");
    const [trimColor, setTrimColor] = useState<string>("#1f2937");
    const [deckName, setDeckName] = useState<string>("");
    const [deckDescription, setDeckDescription] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        }
    }, [open, deck]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, saving]);

    const rules = useMemo(() => FORMAT_RULES[selectedFormat], [selectedFormat]);

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

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                disabled={saving}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edit Deck"
                    className="
                        w-full max-w-6xl
                        max-h-[90vh]
                        overflow-hidden
                        rounded-2xl border
                        bg-[#f6ead6] dark:bg-[#0f2a2c]
                        border-black/10 dark:border-white/10
                        text-[#193f44] dark:text-[#e8d5b8]
                        shadow-[0_30px_80px_-35px_rgba(0,0,0,0.60)]
                        flex flex-col
                    "
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 p-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">Edit Deck</h3>
                            <p className="text-xs opacity-70 truncate">Update your deck information and appearance.</p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="
                                rounded-md px-3 py-1.5 text-sm font-medium
                                bg-black/5 dark:bg-white/5
                                hover:bg-[#42c99c] dark:hover:bg-[#82664e]
                                border border-[#42c99c] dark:border-[#82664e]
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                dark:focus:ring-[#82664e]
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            aria-label="Close"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 overflow-y-auto">
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
                                        disabled={saving}
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-white/70 dark:bg-white/5
                                            border-black/10 dark:border-white/10
                                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                            dark:focus:ring-[#82664e]
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
                                        disabled={saving}
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-white/70 dark:bg-white/5
                                            border-black/10 dark:border-white/10
                                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                            dark:focus:ring-[#82664e]
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
                                        disabled={saving}
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-white/70 dark:bg-white/5
                                            border-black/10 dark:border-white/10
                                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                            dark:focus:ring-[#82664e]
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
                                            bg-black/5 dark:bg-white/5
                                            border-black/10 dark:border-white/10
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
                                {rules.notes?.length ? (
                                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                                            Notes
                                        </div>
                                        <ul className="mt-2 list-disc pl-5 text-sm opacity-80 space-y-1">
                                            {rules.notes.map((n) => (
                                                <li key={n}>{n}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>

                            {/* Column 3: Appearance */}
                            <div className="space-y-4">
                                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-3">
                                        Appearance
                                    </div>

                                    <div className="space-y-3">
                                        {/* Deck Box Color */}
                                        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-medium opacity-80">Deck Box</div>
                                                <div className="text-xs opacity-60 truncate">{deckBoxColor}</div>
                                            </div>

                                            <input
                                                aria-label="Deck box color"
                                                type="color"
                                                value={deckBoxColor}
                                                onChange={(e) => setDeckBoxColor(e.target.value)}
                                                disabled={saving}
                                                className="
                                                    h-7 w-7 rounded-md
                                                    border border-black/10 dark:border-white/10
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
                                        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2">
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
                                                    disabled={saving}
                                                    className="
                                                    h-7 w-7 rounded-md
                                                    border border-black/10 dark:border-white/10
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
                                                disabled={saving}
                                                className="
                                                    inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium
                                                    border border-black/10 dark:border-white/10
                                                    bg-black/5 dark:bg-white/5
                                                    hover:bg-black/10 dark:hover:bg-white/10
                                                    transition-colors
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                "
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <span
                                                        className="h-3 w-3 rounded-sm border border-black/10 dark:border-white/10"
                                                        style={{ backgroundColor: p.box }}
                                                        aria-hidden
                                                    />
                                                    <span
                                                        className="h-3 w-3 rounded-sm border border-black/10 dark:border-white/10"
                                                        style={{ backgroundColor: p.trim }}
                                                        aria-hidden
                                                    />
                                                </span>
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tiny preview strip */}
                                    <div className="mt-3 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
                                        <div className="h-10" style={{ backgroundColor: deckBoxColor }} />
                                        <div className="h-2" style={{ backgroundColor: trimColor }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10 p-4">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="
                                rounded-md px-4 py-2 text-sm font-medium
                                bg-black/5 dark:bg-white/5
                                hover:bg-black/10 dark:hover:bg-white/10
                                border border-black/10 dark:border-white/10
                                transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={!deckName.trim() || saving}
                            className="
                                rounded-md px-4 py-2 text-sm font-medium text-white
                                bg-[#42c99c] dark:bg-[#82664e]
                                hover:opacity-95 transition-opacity
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RuleCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {label}
            </div>
            <div className="mt-1 text-sm opacity-90">{value}</div>
        </div>
    );
}

