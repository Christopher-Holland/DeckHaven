"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

type Binder = {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null; // Cover color (hex)
    spineColor?: string | null; // Spine color (hex)
    pageColor?: string | null; // Page background color (hex)
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
    const [coverColor, setCoverColor] = useState("#ffffff");
    const [spineColor, setSpineColor] = useState("#1f2937");
    const [pageColor, setPageColor] = useState("#f6ead6");
    const [selectedGame, setSelectedGame] = useState("all");
    const [size, setSize] = useState("2x2");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens/closes or binder changes
    useEffect(() => {
        if (open && binder) {
            setName(binder.name || "");
            setDescription(binder.description || "");
            setCoverColor(binder.color || "#ffffff");
            setSpineColor(binder.spineColor || "#1f2937");
            setPageColor(binder.pageColor || "#f6ead6");
            setSelectedGame(binder.game || "all"); // null means "all" (favorites)
            setSize(binder.size || "2x2");
            setError(null);
        } else if (!open) {
            setName("");
            setDescription("");
            setCoverColor("#ffffff");
            setSpineColor("#1f2937");
            setPageColor("#f6ead6");
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
                    color: coverColor,
                    spineColor: spineColor,
                    pageColor: pageColor,
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
          border border-[var(--theme-border)]
          bg-[var(--theme-bg)]
          text-[var(--theme-fg)]
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
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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
                                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-[var(--theme-sidebar)] border border-[var(--theme-border)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]">
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
                                className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-[var(--theme-sidebar)] border border-[var(--theme-border)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
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
                    bg-[var(--theme-sidebar)]
                    border border-[var(--theme-border)]
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
                    bg-[var(--theme-sidebar)]
                    border border-[var(--theme-border)]
                    focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                    dark:focus:ring-[#82664e]
                    resize-none
                  "
                                placeholder="Optional description..."
                            />
                        </label>

                        {/* Cover Color */}
                        <label className="text-sm block">
                            <span className="opacity-80">Cover Color</span>
                            <div className="mt-1 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={coverColor}
                                    onChange={(e) => setCoverColor(e.target.value)}
                                    className="
                                        w-16 h-10 rounded-md
                                        border border-[var(--theme-border)]
                                        cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                />
                                <input
                                    type="text"
                                    value={coverColor}
                                    onChange={(e) => setCoverColor(e.target.value)}
                                    placeholder="#ffffff"
                                    className="
                                        flex-1 rounded-md px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                />
                            </div>
                        </label>

                        {/* Spine Color */}
                        <label className="text-sm block">
                            <span className="opacity-80">Spine Color</span>
                            <div className="mt-1 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={spineColor}
                                    onChange={(e) => setSpineColor(e.target.value)}
                                    className="
                                        w-16 h-10 rounded-md
                                        border border-[var(--theme-border)]
                                        cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                />
                                <input
                                    type="text"
                                    value={spineColor}
                                    onChange={(e) => setSpineColor(e.target.value)}
                                    placeholder="#1f2937"
                                    className="
                                        flex-1 rounded-md px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                />
                            </div>
                        </label>

                        {/* Page Background Color */}
                        <label className="text-sm block">
                            <span className="opacity-80">Page Background Color</span>
                            <div className="mt-1 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={pageColor}
                                    onChange={(e) => setPageColor(e.target.value)}
                                    className="
                                        w-16 h-10 rounded-md
                                        border border-[var(--theme-border)]
                                        cursor-pointer
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                />
                                <input
                                    type="text"
                                    value={pageColor}
                                    onChange={(e) => setPageColor(e.target.value)}
                                    placeholder="#f6ead6"
                                    className="
                                        flex-1 rounded-md px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                    "
                                />
                            </div>
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
              bg-[var(--theme-accent)]
              text-white
              hover:opacity-95
              transition-opacity
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
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

