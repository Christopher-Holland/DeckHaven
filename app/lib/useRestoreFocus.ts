/**
 * Restores focus to the previously focused element when a modal/drawer closes.
 * Call with isOpen=true when opening; when isOpen becomes false, focus is restored.
 *
 * @param isOpen - Whether the modal/drawer is open
 */

import { useEffect, useRef } from "react";

export function useRestoreFocus(isOpen: boolean): void {
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement | null;
        } else {
            const toRestore = previousActiveElement.current;
            if (toRestore && typeof toRestore.focus === "function") {
                toRestore.focus();
                previousActiveElement.current = null;
            }
        }
    }, [isOpen]);
}
