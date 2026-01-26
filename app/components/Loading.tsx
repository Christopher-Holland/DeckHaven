/**
 * Loading Spinner Component
 * 
 * Displays an animated spinning wheel loading indicator.
 * Supports customizable size and optional loading message.
 * 
 * @component
 * @example
 * <Loading message="Loading sets..." size="lg" />
 */

"use client";

import { motion } from "framer-motion";

type LoadingProps = {
    /** Optional loading message displayed below the spinner */
    message?: string;
    /** Size of the spinner: "sm", "md", or "lg" */
    size?: "sm" | "md" | "lg";
};

export default function Loading({
    message = "Loading...",
    size = "md",
}: LoadingProps) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-[3px]",
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
                className={`rounded-full ${sizeClasses[size]} border-[var(--theme-accent)]`}
                style={{
                    borderTopColor: "transparent", // Creates the spinning effect
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            {message && (
                <span className="text-sm opacity-80">{message}</span>
            )}
        </div>
    );
}
