"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useDrawer } from "./drawerProvider";
import { Button } from "@/app/components/Button";
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
        <div ref={containerRef} className="fixed inset-0 z-[100]">
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
          absolute right-0 top-0 h-[100dvh] max-h-[100dvh] w-full sm:w-[420px] md:w-[480px]
          bg-[var(--theme-bg)] text-[var(--theme-fg)]
          border-l border-[var(--theme-border)]/40
          shadow-[-18px_0_40px_rgba(0,0,0,0.55)]
          animate-in slide-in-from-right duration-300
          flex flex-col min-h-0
        "
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--theme-border)]/25 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                    <div className="min-w-0">
                        {title ? (
                            <h2 className="text-sm uppercase tracking-widest text-[var(--theme-fg)]/90 truncate">
                                {title}
                            </h2>
                        ) : (
                            <div className="h-4" />
                        )}
                    </div>

                    <Button
                        ref={closeButtonRef}
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={close}
                        aria-label="Close drawer"
                        className="h-9 w-9 min-h-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] touch-pan-y">
                    {children}
                </div>
            </aside>
        </div>
    );
}