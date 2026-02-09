"use client";

import { X, Trash2 } from "lucide-react";

type Props = {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDeleteModal({
    open,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this? This action cannot be undone.",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    destructive = true,
    loading = false,
    onConfirm,
    onCancel,
}: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onMouseDown={onCancel}
            />

            {/* Modal */}
            <div
                className="
          relative w-[min(420px,92vw)]
          rounded-xl
          border border-[var(--theme-border)]
          bg-[var(--theme-bg)]
          text-[var(--theme-fg)]
          shadow-2xl
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-[var(--theme-border)]">
                    <div className="flex items-center gap-2">
                        {destructive && (
                            <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                        <h3 className="text-lg font-semibold">{title}</h3>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="
              p-2 rounded-md
              bg-[var(--theme-sidebar)]
              hover:opacity-90
              border border-[var(--theme-border)]
              transition-colors
            "
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    <p className="text-sm opacity-80">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--theme-border)]">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
              px-4 py-2 rounded-md text-sm
              bg-[var(--theme-sidebar)]
              hover:opacity-90
              border border-[var(--theme-border)]
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${destructive
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white"
                            }
            `}
                    >
                        {loading ? "Deleting..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}