"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

type Binder = {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    game?: string | null; // "all" (favorites), "mtg", "pokemon", "yugioh" - null means favorites/all games
    size?: string | null; // "2x2", "3x3", "4x4"
};

type Props = {
    open: boolean;
    binder: Binder | null;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function EditBinderModal({ open, binder, onClose, onSuccess }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [binderColor, setBinderColor] = useState("white");
    const [selectedGame, setSelectedGame] = useState("all");
    const [size, setSize] = useState("2x2");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens/closes or binder changes
    useEffect(() => {
        if (open && binder) {
            setName(binder.name || "");
            setDescription(binder.description || "");
            setBinderColor(binder.color || "white");
            setSelectedGame(binder.game || "all"); // null means "all" (favorites)
            setSize(binder.size || "2x2");
            setError(null);
        } else if (!open) {
            setName("");
            setDescription("");
            setBinderColor("white");
            setSelectedGame("all");
            setSize("2x2");
            setError(null);
        }
    }, [open, binder]);

    // Escape to close
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, saving]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!binder) return;

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/binders/${binder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    color: binderColor,
                    game: selectedGame === "all" ? null : selectedGame, // Store null for "all" (favorites)
                    size: size,
                }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to update binder";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Success - close modal and refresh
            onClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update binder");
        } finally {
            setSaving(false);
        }
    }

    const colors = ["white", "black", "slate", "stone", "red", "rose", "orange", "amber", "blue", "sky", "cyan", "teal", "green", "emerald", "lime", "purple", "violet", "pink", "gold"];

    if (!open || !binder) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-label="Edit Binder"
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
                    <h3 className="text-lg font-semibold">Edit Binder</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="
              p-2 rounded-md
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
              disabled:opacity-50
            "
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-4">
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        {/* Game */}
                        <label className="text-sm block">
                            <span className="opacity-80">Game <span className="text-red-500">*</span></span>
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-[#e8d5b8] dark:bg-[#173c3f] border border-[#42c99c] dark:border-[#82664e] focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]">
                                <option value="all">Favorites (All Games)</option>
                                <option value="mtg">Magic the Gathering</option>
                                <option value="pokemon">Pokémon</option>
                                <option value="yugioh">Yu-Gi-Oh!</option>
                            </select>
                        </label>

                        {/* Size */}
                        <label className="text-sm block">
                            <span className="opacity-80">Size</span>
                            <select
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-[#e8d5b8] dark:bg-[#173c3f] border border-[#42c99c] dark:border-[#82664e] focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                            >
                                <option value="2x2">2x2</option>
                                <option value="3x3">3x3</option>
                                <option value="4x4">4x4</option>
                            </select>
                        </label>

                        {/* Name */}
                        <label className="text-sm block">
                            <span className="opacity-80">Name</span>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="
                    mt-1 w-full rounded-md px-3 py-2 text-sm
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                  "
                                placeholder="Enter binder name"
                            />
                        </label>

                        {/* Description */}
                        <label className="text-sm block">
                            <span className="opacity-80">Description</span>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="
                    mt-1 w-full rounded-md px-3 py-2 text-sm
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                    resize-none
                  "
                                placeholder="Optional description..."
                            />
                        </label>

                        {/* Color */}
                        <label className="text-sm block">
                            <span className="opacity-80">Color</span>
                            <select
                                value={binderColor}
                                onChange={(e) => setBinderColor(e.target.value)}
                                className="
                    mt-1 w-full rounded-md px-3 py-2 text-sm
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    border border-[#42c99c] dark:border-[#82664e]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                  "
                            >
                                {colors.map((color) => (
                                    <option key={color} value={color}>
                                        {color.charAt(0).toUpperCase() + color.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-2">
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
            "
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="
              px-3 py-2 rounded-md text-sm font-medium
              bg-[#42c99c] dark:bg-[#82664e]
              text-white
              hover:opacity-95
              transition-opacity
              focus:outline-none focus:ring-2 focus:ring-[#42c99c]
              dark:focus:ring-[#82664e]
              disabled:opacity-50 disabled:cursor-not-allowed
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
                </form>
            </div>
        </div>
    );
}

