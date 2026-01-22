"use client";

import { useEffect, useMemo, useState } from "react";
import { FORMAT_RULES, type FormatKey, type FormatRules } from "@/app/lib/mtgFormatRules";
import { useDrawer } from "./drawerProvider";

type Deck = {
    id: string;
    name: string;
    description: string | null;
    format: string | null;
    game: string;
    deckBoxColor: string | null;
    trimColor: string | null;
};

function RuleCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {label}
            </div>
            <div className="mt-1 text-sm opacity-90">{value}</div>
        </div>
    );
}

export function EditDeckDrawer() {
    const { state, close } = useDrawer();
    const deck = state.payload?.deck as Deck | null;
    const onSuccess = state.payload?.onSuccess as (() => Promise<void> | void) | undefined;

    const [selectedFormat, setSelectedFormat] = useState<FormatKey>("Standard");
    const [deckBoxColor, setDeckBoxColor] = useState<string>("#ffffff");
    const [trimColor, setTrimColor] = useState<string>("#1f2937");
    const [deckName, setDeckName] = useState<string>("");
    const [deckDescription, setDeckDescription] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when deck changes
    useEffect(() => {
        if (deck) {
            setDeckName(deck.name || "");
            setDeckDescription(deck.description || "");
            setSelectedFormat((deck.format as FormatKey) || "Standard");
            setDeckBoxColor(deck.deckBoxColor || "#ffffff");
            setTrimColor(deck.trimColor || "#1f2937");
            setError(null);
        }
    }, [deck]);

    const rules = useMemo(() => FORMAT_RULES[selectedFormat] as FormatRules, [selectedFormat]);

    const handleSubmit = async () => {
        if (!deck || !deckName.trim()) {
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

            close();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update deck");
        } finally {
            setSaving(false);
        }
    };

    if (!deck) return null;

    return (
        <div className="space-y-4">
            {error && (
                <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/50 px-4 py-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

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
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="rounded-md border px-3 py-2 text-sm bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                    {rules.category}
                </div>
            </div>

            {/* Rules summary */}
            <div>
                <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
                    Format Rules
                </div>
                <div className="grid grid-cols-1 gap-2">
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
            {rules.notes && rules.notes.length > 0 && (
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                        Notes
                    </div>
                    <ul className="mt-2 list-disc pl-5 text-sm opacity-80 space-y-1">
                        {rules.notes.map((n: string) => (
                            <li key={n}>{n}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Appearance */}
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3">
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
                            className="h-7 w-7 rounded-md border border-black/10 dark:border-white/10 overflow-hidden cursor-pointer bg-transparent p-0 disabled:opacity-50 disabled:cursor-not-allowed [appearance:none] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md"
                        />
                    </div>

                    {/* Trim Color */}
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2">
                        <div className="min-w-0">
                            <div className="text-xs font-medium opacity-80">Trim</div>
                            <div className="text-xs opacity-60 truncate">{trimColor}</div>
                        </div>
                        <input
                            aria-label="Trim color"
                            type="color"
                            value={trimColor}
                            onChange={(e) => setTrimColor(e.target.value)}
                            disabled={saving}
                            className="h-7 w-7 rounded-md border border-black/10 dark:border-white/10 overflow-hidden cursor-pointer bg-transparent p-0 disabled:opacity-50 disabled:cursor-not-allowed [appearance:none] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md"
                        />
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
                            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10 pt-4 mt-4">
                <button
                    onClick={close}
                    disabled={saving}
                    className="rounded-md px-4 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!deckName.trim() || saving}
                    className="rounded-md px-4 py-2 text-sm font-medium text-white bg-[#42c99c] dark:bg-[#82664e] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
