"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDrawer } from "./drawerProvider";

export function NewBinderDrawer() {
    const { state, close } = useDrawer();
    const onSuccess = state.payload?.onSuccess as (() => void) | undefined;

    const [selectedGame, setSelectedGame] = useState("all");
    const [size, setSize] = useState("2x2");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [coverColor, setCoverColor] = useState("#ffffff");
    const [spineColor, setSpineColor] = useState("#1f2937");
    const [pageColor, setPageColor] = useState("#f6ead6");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when drawer opens
    useEffect(() => {
        setSelectedGame("all");
        setSize("2x2");
        setName("");
        setDescription("");
        setCoverColor("#ffffff");
        setSpineColor("#1f2937");
        setPageColor("#f6ead6");
        setError(null);
    }, [state.type]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/binders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    color: coverColor,
                    spineColor: spineColor,
                    pageColor: pageColor,
                    game: selectedGame === "all" ? null : selectedGame,
                    size: size,
                }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to create binder";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            close();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create binder");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Game */}
            <label className="text-sm block">
                <span className="opacity-80">Game <span className="text-red-500">*</span></span>
                <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]">
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
                    className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                    placeholder="Enter binder name"
                />
            </label>

            {/* Description */}
            <label className="text-sm block">
                <span className="opacity-80">Description</span>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] resize-none"
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
                        className="w-16 h-10 rounded-md border border-black/10 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                    />
                    <input
                        type="text"
                        value={coverColor}
                        onChange={(e) => setCoverColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
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
                        className="w-16 h-10 rounded-md border border-black/10 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                    />
                    <input
                        type="text"
                        value={spineColor}
                        onChange={(e) => setSpineColor(e.target.value)}
                        placeholder="#1f2937"
                        className="flex-1 rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
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
                        className="w-16 h-10 rounded-md border border-black/10 dark:border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                    />
                    <input
                        type="text"
                        value={pageColor}
                        onChange={(e) => setPageColor(e.target.value)}
                        placeholder="#f6ead6"
                        className="flex-1 rounded-md px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                    />
                </div>
            </label>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={close}
                    disabled={saving}
                    className="px-3 py-2 rounded-md text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-[#42c99c] dark:bg-[#82664e] text-white hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Creating...
                        </>
                    ) : (
                        "Create"
                    )}
                </button>
            </div>
        </form>
    );
}
