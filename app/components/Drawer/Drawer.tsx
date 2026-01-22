"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useDrawer } from "./drawerProvider";

export function Drawer({
    title,
    children,
}: {
    title?: string;
    children: React.ReactNode;
}) {
    const { state, close } = useDrawer();
    const isOpen = state.type !== null;

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

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <button
                aria-label="Close drawer"
                onClick={close}
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <aside
                className="
          absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px]
          bg-[#0f2a2c] text-[#e8d5b8]
          border-l border-[#9e7c60]/40
          shadow-[-18px_0_40px_rgba(0,0,0,0.55)]
          animate-in slide-in-from-right duration-300
          flex flex-col
        "
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#9e7c60]/25">
                    <div className="min-w-0">
                        {title ? (
                            <h2 className="text-sm uppercase tracking-widest text-[#e8d5b8]/90 truncate">
                                {title}
                            </h2>
                        ) : (
                            <div className="h-4" />
                        )}
                    </div>

                    <button
                        onClick={close}
                        className="rounded-md p-2 hover:bg-white/10 transition"
                        aria-label="Close"
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