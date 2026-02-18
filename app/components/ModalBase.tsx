/**
 * Accessible modal base component.
 * Provides focus trap, focus restoration, Escape to close, and ARIA attributes.
 * Use for consistent a11y across all modals.
 */

"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useFocusTrap } from "@/app/lib/useFocusTrap";
import { useRestoreFocus } from "@/app/lib/useRestoreFocus";
import { useInitialFocus } from "@/app/lib/useInitialFocus";

type ModalBaseProps = {
    open: boolean;
    onClose: () => void;
    /** Accessible label for the dialog (required for screen readers) */
    ariaLabel: string;
    /** Optional ID of element describing the modal content */
    ariaDescribedBy?: string;
    children: ReactNode;
    /** Optional ref to focus when modal opens (default: first focusable) */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /** Additional class for the outer container */
    className?: string;
};

export function ModalBase({
    open,
    onClose,
    ariaLabel,
    ariaDescribedBy,
    children,
    initialFocusRef,
    className = "",
}: ModalBaseProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useFocusTrap(containerRef, open);
    useRestoreFocus(open);
    useInitialFocus(containerRef, open, initialFocusRef);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            className={className}
        >
            {children}
        </div>
    );
}
