"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useDrawer } from "./drawerProvider";
import { useFocusTrap } from "@/app/lib/useFocusTrap";
import { useRestoreFocus } from "@/app/lib/useRestoreFocus";
import { useInitialFocus } from "@/app/lib/useInitialFocus";

export function Drawer({
    title,
    children,
}: {
    title?: string;
    children: React.ReactNode;
}) {
    const { state, close } = useDrawer();
    const isOpen = state.type !== null;
    const containerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useFocusTrap(containerRef, isOpen);
    useRestoreFocus(isOpen);
    useInitialFocus(containerRef, isOpen, closeButtonRef);

    // Escape to close
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, close]);

    if (!isOpen) return null;

    const ariaLabel = title ? `${title} drawer` : "Drawer";

    return (
        <div ref={containerRef} className="fixed inset-0 z-50">
            {/* Overlay */}
            <button
                type="button"
                aria-label="Close drawer"
                onClick={close}
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <aside
                className="
          absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px]
          bg-[var(--theme-bg)] text-[var(--theme-fg)]
          border-l border-[var(--theme-border)]/40
          shadow-[-18px_0_40px_rgba(0,0,0,0.55)]
          animate-in slide-in-from-right duration-300
          flex flex-col
        "
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]/25">
                    <div className="min-w-0">
                        {title ? (
                            <h2 className="text-sm uppercase tracking-widest text-[var(--theme-fg)]/90 truncate">
                                {title}
                            </h2>
                        ) : (
                            <div className="h-4" />
                        )}
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={close}
                        className="rounded-md p-2 hover:bg-black/10 dark:hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                        aria-label="Close drawer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
            </aside>
        </div>
    );
}