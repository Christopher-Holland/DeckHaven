"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

export default function Sets() {
    const router = useRouter();

    // Empty state - ready for database integration
    // When database is connected, this will fetch user's favorited/tracked sets
    const mySets: never[] = [];

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
            {/* Page Header */}
            <section className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">My Sets</h2>

                <button
                    type="button"
                    onClick={() => router.push("/sets/browse")}
                    className="
            group
            text-sm font-medium
            flex items-center gap-2
            px-3 py-1.5
            rounded-md
            border border-[#42c99c] dark:border-[#82664e]
            text-[#193f44] dark:text-[#e8d5b8]
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition-all duration-200 ease-out
            hover:translate-x-0.5
            focus:outline-none
            focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
            cursor-pointer
          "
                >
                    Browse All Sets
                    <ArrowRightIcon
                        className="
              w-4 h-4
              transition-transform duration-200
              group-hover:translate-x-1
            "
                    />
                </button>
            </section>

            {/* Empty State */}
            <section className="mt-6">
                <div
                    className="
                        rounded-lg
                        border border-dashed border-[#42c99c] dark:border-[#82664e]
                        bg-transparent
                        p-12
                        flex flex-col items-center justify-center
                        text-center
                        opacity-70
                    "
                >
                    <p className="text-lg font-medium mb-2">No sets tracked yet</p>
                    <p className="text-sm opacity-80 mb-4">
                        Start browsing sets and add them to your collection
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/sets/browse")}
                        className="
                            text-sm font-medium
                            px-4 py-2 rounded-md
                            bg-[#42c99c] dark:bg-[#82664e]
                            text-white
                            hover:bg-[#36c293] dark:hover:bg-[#9d7a5f]
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                        "
                    >
                        Browse All Sets
                    </button>
                </div>
            </section>
        </main>
    );
}