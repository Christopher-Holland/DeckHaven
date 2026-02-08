"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
    CARD_TYPE_OPTIONS,
    COLOR_OPTIONS,
    RARITY_OPTIONS,
    MANA_VALUE_OPTIONS,
    type SetCardFilters,
} from "./setCardFilters";

type SetCardFiltersModalProps = {
    open: boolean;
    filters: SetCardFilters;
    onClose: () => void;
    onApply: (filters: SetCardFilters) => void;
    onClear: () => void;
};

export default function SetCardFiltersModal({
    open,
    filters: initialFilters,
    onClose,
    onApply,
    onClear,
}: SetCardFiltersModalProps) {
    const [filters, setFilters] = useState<SetCardFilters>(initialFilters);

    // Sync with prop changes
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters, open]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const handleClear = () => {
        const clearedFilters: SetCardFilters = {
            cardType: "all",
            color: "all",
            rarity: "all",
            manaValue: "all",
        };
        setFilters(clearedFilters);
        onClear();
        onClose();
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

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
                    aria-label="Card Filters"
                    className="
                        w-full max-w-2xl
                        max-h-[90vh]
                        overflow-hidden
                        rounded-2xl border
                        bg-[var(--theme-bg)]
                        border-[var(--theme-border)]
                        text-[var(--theme-fg)]
                        shadow-[0_30px_80px_-35px_rgba(0,0,0,0.60)]
                        flex flex-col
                    "
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--theme-border)] p-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">Filter Cards</h3>
                            <p className="text-xs opacity-70 truncate">Filter cards by type, color, rarity, and mana value.</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="
                                rounded-md px-3 py-1.5 text-sm font-medium
                                bg-[var(--theme-card)]
                                hover:bg-[var(--theme-accent)] hover:text-white
                                border border-[var(--theme-border)]
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                            "
                            aria-label="Close"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card Type */}
                            <div>
                                <label className="block text-xs font-medium opacity-80 mb-1">
                                    Card Type
                                </label>
                                <select
                                    value={filters.cardType}
                                    onChange={(e) => setFilters({ ...filters, cardType: e.target.value as SetCardFilters["cardType"] })}
                                    className="
                                        w-full rounded-md border px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                    "
                                >
                                    {CARD_TYPE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-xs font-medium opacity-80 mb-1">
                                    Color
                                </label>
                                <select
                                    value={filters.color}
                                    onChange={(e) => setFilters({ ...filters, color: e.target.value as SetCardFilters["color"] })}
                                    className="
                                        w-full rounded-md border px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                    "
                                >
                                    {COLOR_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rarity */}
                            <div>
                                <label className="block text-xs font-medium opacity-80 mb-1">
                                    Rarity
                                </label>
                                <select
                                    value={filters.rarity}
                                    onChange={(e) => setFilters({ ...filters, rarity: e.target.value as SetCardFilters["rarity"] })}
                                    className="
                                        w-full rounded-md border px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                    "
                                >
                                    {RARITY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Mana Value */}
                            <div>
                                <label className="block text-xs font-medium opacity-80 mb-1">
                                    Mana Value
                                </label>
                                <select
                                    value={filters.manaValue}
                                    onChange={(e) => setFilters({ ...filters, manaValue: e.target.value as SetCardFilters["manaValue"] })}
                                    className="
                                        w-full rounded-md border px-3 py-2 text-sm
                                        bg-[var(--theme-sidebar)]
                                        border-[var(--theme-border)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
                                    "
                                >
                                    {MANA_VALUE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-[var(--theme-border)] p-4">
                        <button
                            onClick={handleClear}
                            className="
                                rounded-md px-4 py-2 text-sm font-medium
                                bg-[var(--theme-card)]
                                hover:opacity-90
                                border border-[var(--theme-border)]
                                transition-colors
                            "
                        >
                            Clear Filters
                            
                        </button>

                        <button
                            onClick={handleApply}
                            className="
                                rounded-md px-4 py-2 text-sm font-medium text-white
                                bg-[var(--theme-accent)]
                                hover:opacity-95 transition-opacity
                            "
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

