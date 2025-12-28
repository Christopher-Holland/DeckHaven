"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import NewBinderModal from "./newBinderModal";
import Loading from "@/app/components/Loading";

type Binder = {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        binderCards: number;
    };
};

export default function BindersPage() {
    const user = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [binders, setBinders] = useState<Binder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch binders
    useEffect(() => {
        if (!user) return;

        async function fetchBinders() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/binders");
                if (!response.ok) {
                    throw new Error("Failed to fetch binders");
                }

                const data = await response.json();
                setBinders(data.binders || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load binders");
            } finally {
                setLoading(false);
            }
        }

        fetchBinders();
    }, [user]);

    const handleBinderCreated = () => {
        // Refresh binders list
        fetch("/api/binders")
            .then((res) => res.json())
            .then((data) => setBinders(data.binders || []))
            .catch((err) => console.error("Failed to refresh binders:", err));
    };

    if (loading) {
        return (
            <main
                className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
        transition-all duration-300
      "
            >
                <Loading />
            </main>
        );
    }

    if (error) {
        return (
            <main
                className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
        transition-all duration-300
      "
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-lg text-red-500">Error: {error}</p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
        transition-all duration-300
      "
        >
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Binders</h2>
                    <p className="text-sm opacity-70 mt-1">Create and manage your favorite binder layouts.</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-black/5 dark:bg-white/5 border border-[#42c99c] dark:border-[#82664e] hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#42c99c] dark:focus:ring-[#82664e]"
                        onClick={() => setIsOpen(true)}
                    >
                        Add Binder
                    </button>
                </div>
            </section>

            {/* Binders Grid */}
            {binders.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {binders.map((binder) => (
                        <div
                            key={binder.id}
                            className="
                                rounded-lg p-4
                                border border-[#42c99c] dark:border-[#82664e]
                                bg-[#e8d5b8] dark:bg-[#173c3f]
                                hover:bg-black/5 dark:hover:bg-white/5
                                transition-colors cursor-pointer
                            "
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{binder.name}</h3>
                                {binder.color && (
                                    <div
                                        className="w-6 h-6 rounded-full border border-black/20 dark:border-white/20 flex-shrink-0"
                                        style={{
                                            backgroundColor: binder.color === "white" ? "#ffffff" : binder.color,
                                            borderColor: binder.color === "white" ? "#ccc" : undefined,
                                        }}
                                        title={binder.color}
                                    />
                                )}
                            </div>
                            {binder.description && (
                                <p className="text-sm opacity-70 mb-3 line-clamp-2">{binder.description}</p>
                            )}
                            <p className="text-xs opacity-60">
                                {binder._count.binderCards} {binder._count.binderCards === 1 ? "card" : "cards"}
                            </p>
                        </div>
                    ))}
                </section>
            ) : (
                <section className="
                    rounded-lg p-12 text-center
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                ">
                    <p className="text-sm opacity-70 mb-4">No binders yet. Create your first binder to get started!</p>
                    <button
                        className="px-4 py-2 rounded-md text-sm font-medium bg-[#42c99c] dark:bg-[#82664e] text-white hover:opacity-95 transition-opacity"
                        onClick={() => setIsOpen(true)}
                    >
                        Create Binder
                    </button>
                </section>
            )}

            <NewBinderModal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={handleBinderCreated}
            />
        </main>
    );
}