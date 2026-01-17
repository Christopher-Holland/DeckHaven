"use client";

import { X } from "lucide-react";
import { useToast } from "./ToastContext";

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        min-w-[300px] max-w-[500px]
                        rounded-lg border p-4 shadow-lg
                        flex items-start gap-3
                        animate-in slide-in-from-right
                        ${toast.type === "error"
                            ? "bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                            : toast.type === "success"
                            ? "bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                            : toast.type === "warning"
                            ? "bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
                            : "bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                        }
                    `}
                >
                    <p className="flex-1 text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="
                            flex-shrink-0
                            rounded-md p-1
                            hover:bg-black dark:hover:bg-white
                            transition-colors
                        "
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
