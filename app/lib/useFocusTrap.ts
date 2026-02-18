/**
 * Focus trap hook for modals and drawers.
 * Keeps focus within the container; Tab cycles through focusable elements.
 *
 * @param containerRef - Ref to the modal/drawer container
 * @param isActive - Whether the trap is active (e.g. modal is open)
 */

import { useEffect, RefObject } from "react";

const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
    );
}

export function useFocusTrap(
    containerRef: RefObject<HTMLElement | null>,
    isActive: boolean
): void {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            const focusable = getFocusableElements(container);
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: if focus is on first, wrap to last
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: if focus is on last, wrap to first
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        container.addEventListener("keydown", handleKeyDown);
        return () => container.removeEventListener("keydown", handleKeyDown);
    }, [isActive, containerRef]);
}
