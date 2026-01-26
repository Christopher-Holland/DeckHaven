"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { FORMAT_RULES, type FormatKey, type FormatRules } from "@/app/lib/mtgFormatRules";

type DeckData = {
    name: string;
    description?: string;
    format: FormatKey;
    game: "mtg" | "pokemon" | "yugioh";
    deckBoxColor: string;
    trimColor: string;
};

type OpenDeckModalProps = {
    open: boolean;
    title?: string;
    description?: string;

    /** Optional: if you want the modal to show a specific format's rules */
    format?: FormatKey;

    // Deck box details
    deckBoxColor?: string;
    trimColor?: string;

    onClose: () => void;
    onSuccess?: (deckData: DeckData) => Promise<void> | void;
    children?: React.ReactNode;
};

export default function OpenDeckModal({
    open,
    title = "Create Deck",
    description = "Choose a format and review the deck rules.",
    format = "Standard",
    deckBoxColor: initialDeckBoxColor = "#ffffff",
    trimColor: initialTrimColor = "#1f2937",
    onClose,
    onSuccess,
    children,
}: OpenDeckModalProps) {
    const [selectedFormat, setSelectedFormat] = useState<FormatKey>(format);
    const [deckBoxColor, setDeckBoxColor] = useState<string>(initialDeckBoxColor);
    const [trimColor, setTrimColor] = useState<string>(initialTrimColor);
    const [deckName, setDeckName] = useState<string>("");
    const [deckDescription, setDeckDescription] = useState<string>("");

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            setDeckName("");
            setDeckDescription("");
            setSelectedFormat(format);
            setDeckBoxColor(initialDeckBoxColor);
            setTrimColor(initialTrimColor);
        }
    }, [open, format, initialDeckBoxColor, initialTrimColor]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const rules = useMemo(() => FORMAT_RULES[selectedFormat] as FormatRules, [selectedFormat]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    className="
                        w-full max-w-6xl
                        max-h-[90vh]
                        overflow-hidden
                        rounded-2xl border
                        bg-[var(--theme-bg)]
                        border-black/10 dark:border-white/10
                        text-[var(--theme-fg)]
                        shadow-[0_30px_80px_-35px_rgba(0,0,0,0.60)]
                        flex flex-col
                        "
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 p-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">{title}</h3>
                            <p className="text-xs opacity-70 truncate">{description}</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="
                rounded-md px-3 py-1.5 text-sm font-medium
                bg-black/5 dark:bg-white/5
                hover:bg-[var(--theme-accent)]
                border border-[var(--theme-border)]
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                dark:focus:ring-[#82664e]
              "
                            aria-label="Close"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 overflow-y-auto">
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
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-white/70 dark:bg-white/5
                                            border-black/10 dark:border-white/10
                                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-white/70 dark:bg-white/5
                                            border-black/10 dark:border-white/10
                                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                            resize-none
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
                                        className="
                                            w-full rounded-md border px-3 py-2 text-sm
                                            bg-white/70 dark:bg-white/5
                                            border-black/10 dark:border-white/10
                                            focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
                                {rules.notes && rules.notes.length > 0 ? (
                                    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
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

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-7 w-7 rounded-md border border-black/10 dark:border-white/10"
                                                    style={{ backgroundColor: deckBoxColor }}
                                                    aria-hidden
                                                />
                                                <input
                                                    aria-label="Deck box color"
                                                    type="color"
                                                    value={deckBoxColor}
                                                    onChange={(e) => setDeckBoxColor(e.target.value)}
                                                    className="h-9 w-12 cursor-pointer bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Trim Color */}
                                        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2">
                                            <div className="min-w-0">
                                                <div className="text-xs font-medium opacity-80">Trim</div>
                                                <div className="text-xs opacity-60 truncate">{trimColor}</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-7 w-7 rounded-md border border-black/10 dark:border-white/10"
                                                    style={{ backgroundColor: trimColor }}
                                                    aria-hidden
                                                />
                                                <input
                                                    aria-label="Trim color"
                                                    type="color"
                                                    value={trimColor}
                                                    onChange={(e) => setTrimColor(e.target.value)}
                                                    className="h-9 w-12 cursor-pointer bg-transparent"
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
                                                className="
                                                    inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium
                                                    border border-black/10 dark:border-white/10
                                                    bg-black/5 dark:bg-white/5
                                                    hover:bg-black/10 dark:hover:bg-white/10
                                                    transition-colors
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

                        {/* Slot for your future form fields */}
                        {children ? <div className="mt-4">{children}</div> : null}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10 p-4">
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
                            onClick={async () => {
                                if (!deckName.trim()) {
                                    alert("Please enter a deck name");
                                    return;
                                }

                                // All formats shown are MTG formats, so default to mtg
                                // In the future, this could be determined based on format selection
                                const game: "mtg" | "pokemon" | "yugioh" = "mtg";

                                if (onSuccess) {
                                    try {
                                        await onSuccess({
                                            name: deckName.trim(),
                                            description: deckDescription.trim() || undefined,
                                            format: selectedFormat,
                                            game,
                                            deckBoxColor,
                                            trimColor,
                                        });

                                        // Reset form only on success
                                        setDeckName("");
                                        setDeckDescription("");
                                        setSelectedFormat(format);
                                        setDeckBoxColor(initialDeckBoxColor);
                                        setTrimColor(initialTrimColor);
                                        onClose();
                                    } catch (error) {
                                        // Error handling is done in the parent component
                                    }
                                } else {
                                    // If no onSuccess, just close
                                    onClose();
                                }
                            }}
                            disabled={!deckName.trim()}
                            className="
                rounded-md px-4 py-2 text-sm font-medium text-white
                bg-[var(--theme-accent)]
                hover:opacity-95 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            Create Deck
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