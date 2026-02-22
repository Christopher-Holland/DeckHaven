/**
 * Loading Spinner Component
 * 
 * Displays an animated spinning wheel loading indicator.
 * Supports customizable size and optional loading message.
 * When fullPage is true (default), centers the spinner in the viewport.
 * 
 * @component
 * @example
 * <Loading message="Loading sets..." size="lg" />
 * <Loading message="Searching..." fullPage={false} />
 */

"use client";

import { motion } from "framer-motion";

type LoadingProps = {
    /** Optional loading message displayed below the spinner */
    message?: string;
    /** Size of the spinner: "sm", "md", or "lg" */
    size?: "sm" | "md" | "lg";
    /** When true (default), centers spinner in viewport. When false, inline only. */
    fullPage?: boolean;
};

export default function Loading({
    message = "Loading...",
    size = "md",
    fullPage = true,
}: LoadingProps) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-[3px]",
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-6">
            <motion.div
                className={`rounded-full ${sizeClasses[size]} border-[var(--theme-accent)]`}
                style={{
                    borderTopColor: "transparent", // Creates the spinning effect
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            {message && (
                <span className="text-sm text-[var(--theme-fg)] opacity-90">{message}</span>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
}
