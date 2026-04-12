"use client";

import { useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/app/components/Button";
import { useFocusTrap } from "@/app/lib/useFocusTrap";
import { useRestoreFocus } from "@/app/lib/useRestoreFocus";
import { useInitialFocus } from "@/app/lib/useInitialFocus";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useFocusTrap(containerRef, open);
    useRestoreFocus(open);
    useInitialFocus(containerRef, open, cancelButtonRef);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-message"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0 bg-black/60 cursor-default"
                onClick={onCancel}
            />

            {/* Modal */}
            <div
                className="
          relative z-10 w-full max-h-[min(88dvh,100svh)] overflow-y-auto overscroll-contain
          rounded-t-2xl border border-[var(--theme-border)] border-b-0 sm:rounded-xl sm:border-b
          bg-[var(--theme-bg)] text-[var(--theme-fg)] shadow-2xl
          sm:w-[min(420px,92vw)] sm:max-h-none
        "
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-[var(--theme-border)]">
                    <div className="flex items-center gap-2">
                        {destructive && (
                            <Trash2 className="w-5 h-5 text-red-500" aria-hidden />
                        )}
                        <h3 id="confirm-delete-title" className="text-lg font-semibold">{title}</h3>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={onCancel}
                        aria-label="Close"
                        className="border-[var(--theme-border)] bg-[var(--theme-sidebar)]"
                    >
                        <X className="h-4 w-4" aria-hidden />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-4">
                    <p id="confirm-delete-message" className="text-sm opacity-80">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-2 border-t border-[var(--theme-border)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        ref={cancelButtonRef}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full border-[var(--theme-border)] bg-[var(--theme-sidebar)] sm:w-auto min-h-[44px]"
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        type="button"
                        variant={destructive ? "danger" : "primary"}
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto min-h-[44px]"
                    >
                        {loading ? "Deleting..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}