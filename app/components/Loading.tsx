"use client";

import { motion } from "framer-motion";

type Props = {
    message?: string;
    size?: "sm" | "md" | "lg";
};

export default function Loading({
    message = "Loading...",
    size = "md",
}: Props) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-[3px]",
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
                className={`rounded-full ${sizeClasses[size]} border-[#42c99c] dark:border-[#82664e]`}
                style={{
                    borderTopColor: "transparent",
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
