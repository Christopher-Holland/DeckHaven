/**
 * Focuses a specific element or the first focusable when a modal/drawer opens.
 * Use with useFocusTrap for full keyboard accessibility.
 *
 * @param containerRef - Ref to the modal/drawer container (used if initialFocusRef not provided)
 * @param isOpen - Whether the modal/drawer is open
 * @param initialFocusRef - Optional ref to focus instead of first focusable in container
 */

import { useEffect, RefObject } from "react";

const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
    return focusable[0] ?? null;
}

export function useInitialFocus(
    containerRef: RefObject<HTMLElement | null>,
    isOpen: boolean,
    initialFocusRef?: RefObject<HTMLElement | null>
): void {
    useEffect(() => {
        if (!isOpen) return;

        const frame = requestAnimationFrame(() => {
            if (initialFocusRef?.current) {
                initialFocusRef.current.focus();
            } else if (containerRef.current) {
                const first = getFirstFocusable(containerRef.current);
                if (first) first.focus();
            }
        });

        return () => cancelAnimationFrame(frame);
    }, [isOpen, containerRef, initialFocusRef]);
}
