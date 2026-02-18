/**
 * Card Modal Component
 * 
 * A reusable modal dialog component for displaying detailed card information.
 * Opens when a user clicks on a card in the set detail page. Displays card image,
 * type, mana cost, collector number, rarity, and oracle text.
 * 
 * Features:
 * - Closes on ESC key press
 * - Closes when clicking the backdrop
 * - Closes via close button
 * - Accessible with proper ARIA attributes
 * 
 * @component
 * @example
 * <CardModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Card Name"
 * >
 *   <div>Card content here</div>
 * </CardModal>
 */

"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useFocusTrap } from "@/app/lib/useFocusTrap";
import { useRestoreFocus } from "@/app/lib/useRestoreFocus";
import { useInitialFocus } from "@/app/lib/useInitialFocus";

type CardModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

export default function CardModal({
    open,
    onClose,
    title,
    children,
}: CardModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useFocusTrap(containerRef, open);
    useRestoreFocus(open);
    useInitialFocus(containerRef, open, closeButtonRef);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    const ariaLabel = title ? `${title} card details` : "Card details";

    return (
        <div
            ref={containerRef}
            className="
        fixed inset-0 z-50
        flex items-center justify-center
      "
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 bg-black/50 cursor-default"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div
                className="
          relative z-10
          w-full max-w-4xl
          max-h-[90vh]
          overflow-y-auto
          rounded-lg
          bg-[var(--theme-bg)]
          border border-[var(--theme-border)]
          p-6
          shadow-lg
        "
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h2 className="text-lg font-semibold">{title}</h2>
                    )}
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="
              px-2 py-1 rounded-md
              text-sm opacity-70
              hover:opacity-100
              hover:bg-[var(--theme-sidebar)]
              border border-transparent hover:border-[var(--theme-border)]
              transition
              focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]
            "
                    >
                        <span aria-hidden>✕</span>
                    </button>
                </div>

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
}