"use client";

import { useState } from "react";
import Link from "next/link";
import { StarIcon } from "lucide-react";

export default function Sets() {
    const [isFavorited, setIsFavorited] = useState(false);
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
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">Sets</h2>
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="relative rounded-lg
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    p-4">
                    {/* Favorite Button - top right of card */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsFavorited(!isFavorited);
                        }}
                        className="
                            absolute top-2 right-2 z-10
                            p-1 rounded
                            hover:opacity-80
                            focus:outline-none
                            focus:ring-2 focus:ring-[#42c99c]
                            dark:focus:ring-[#82664e]
                            transition-colors
                            cursor-pointer
                            "
                        aria-label="Favorite set"
                    >
                        <StarIcon
                            className={`
                                w-4 h-4
                                ${isFavorited
                                    ? 'fill-[#42c99c] text-[#42c99c] dark:fill-yellow-300 dark:text-yellow-300'
                                    : 'fill-none text-current'}
  `}
                        />
                    </button>

                    {/* Set Name and Star on same row */}
                    {/* Set Name centered, Star pinned right */}
                    <div className="relative w-full mb-2 border-b border-[#42c99c] dark:border-[#82664e] pb-2">
                        <h3 className="text-md font-semibold text-center px-12">
                            Set 1 Name
                        </h3>
                    </div>
                    <img
                        src="/images/DeckHaven-Shield.png"
                        alt="Set 1"
                        className="w-10 h-10 mx-auto"
                    />

                    <p className="text-sm opacity-80 text-center">
                        Set 1 Description
                    </p>
                    <p className="text-sm opacity-80 text-center">
                        XX of XXX cards
                    </p>
                </div>
            </section>
        </main>
    );
}