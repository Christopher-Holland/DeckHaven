"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Binder = {
    id: string;
    name: string;
    description: string | null;
    _count?: {
        binderCards: number;
    };
};

type SelectBinderModalProps = {
    open: boolean;
    cardId: string;
    onClose: () => void;
    onSelect: (binderId: string, quantity: number) => Promise<void>;
};

export default function SelectBinderModal({
    open,
    cardId,
    onClose,
    onSelect,
}: SelectBinderModalProps) {
    const [binders, setBinders] = useState<Binder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!open) {
            setQuantity(1); // Reset quantity when modal closes
            return;
        }

        async function fetchBinders() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/binders");
                if (!response.ok) {
                    throw new Error("Failed to fetch binders");
                }

                const data = await response.json();
                setBinders(data.binders || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load binders");
            } finally {
                setLoading(false);
            }
        }

        fetchBinders();
    }, [open]);

    const handleSelect = async (binderId: string) => {
        try {
            setAdding(binderId);
            setError(null);
            await onSelect(binderId, quantity);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add card to binder");
        } finally {
            setAdding(null);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                onClick={onClose}
                disabled={!!adding}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select Binder"
                    className="
                        w-full max-w-2xl
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
                            <h3 className="text-base font-semibold truncate">Select Binder</h3>
                            <p className="text-xs opacity-70 truncate">Choose a binder to add this card to.</p>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={!!adding}
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

                        {/* Quantity Selector */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium opacity-80 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1 || !!adding}
                                    className="
                                        rounded-md px-3 py-1.5 text-sm font-medium
                                        bg-black/5 dark:bg-white/5
                                        hover:bg-black/10 dark:hover:bg-white/10
                                        border border-black/10 dark:border-white/10
                                        transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10) || 1;
                                        setQuantity(Math.max(1, Math.min(99, val)));
                                    }}
                                    disabled={!!adding}
                                    className="
                                        w-20 text-center rounded-md border px-3 py-1.5 text-sm
                                        bg-white/70 dark:bg-white/5
                                        border-black/10 dark:border-white/10
                                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                                        dark:focus:ring-[#82664e]
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                    disabled={quantity >= 99 || !!adding}
                                    className="
                                        rounded-md px-3 py-1.5 text-sm font-medium
                                        bg-black/5 dark:bg-white/5
                                        hover:bg-black/10 dark:hover:bg-white/10
                                        border border-black/10 dark:border-white/10
                                        transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-sm opacity-70">Loading binders...</div>
                            </div>
                        ) : binders.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-sm opacity-70 mb-2">No binders found</p>
                                    <p className="text-xs opacity-60">Create a binder first to add cards.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {binders.map((binder) => (
                                    <button
                                        key={binder.id}
                                        onClick={() => handleSelect(binder.id)}
                                        disabled={!!adding}
                                        className="
                                            text-left rounded-lg border p-4
                                            border-black/10 dark:border-white/10
                                            bg-white/70 dark:bg-white/5
                                            hover:bg-black/5 dark:hover:bg-white/10
                                            transition-colors
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium truncate">{binder.name}</div>
                                                {binder.description && (
                                                    <div className="text-sm opacity-70 mt-1 truncate">
                                                        {binder.description}
                                                    </div>
                                                )}
                                                {binder._count && (
                                                    <div className="text-xs opacity-60 mt-1">
                                                        {binder._count.binderCards} card{binder._count.binderCards !== 1 ? "s" : ""}
                                                    </div>
                                                )}
                                            </div>
                                            {adding === binder.id && (
                                                <div className="ml-4 text-sm opacity-70">Adding...</div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10 p-4">
                        <button
                            onClick={onClose}
                            disabled={!!adding}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

