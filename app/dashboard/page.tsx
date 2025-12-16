"use client";

import { useSidebar } from "../components/SidebarContext";

export default function Dashboard() {
    const { isCollapsed } = useSidebar();
    
    return (
        <main className="
            min-h-[calc(100vh-8rem)]
            bg-[#f6ead6] dark:bg-[#0f2a2c]
            px-6 py-6
            text-[#193f44] dark:text-[#e8d5b8]
            transition-all duration-300
        ">
            {/* Page Header */}
            <section className="mb-6">
                <h2 className="text-2xl font-semibold">
                    Dashboard
                </h2>
                <p className="text-sm opacity-80 mt-1">
                    Your collection, decks, and recent activity
                </p>
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1 */}
                <div className="
                    rounded-lg
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    p-4
                ">
                    <h3 className="text-sm font-semibold mb-2">
                        My Collection
                    </h3>
                    <p className="text-xs opacity-80">
                        View and manage your cards
                    </p>
                    <p className="text-xs opacity-80">
                        Total Cards: 100
                    </p>
                    <p className="text-xs opacity-80">
                        Total Sets: 100
                    </p>
                    <p className="text-xs opacity-80">
                        Total Decks: 100
                    </p>
                    <p className="text-xs opacity-80">
                        Total Wishlist: 100
                    </p>
                </div>

                {/* Card 2 */}
                <div className="
                    rounded-lg
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    p-4
                ">
                    <h3 className="text-sm font-semibold mb-2">
                        My Decks
                    </h3>
                    <p className="text-xs opacity-80">
                        Build and edit decks
                    </p>
                    <p className="text-sm font-semibold mb-2">
                        Favorite Deck Name here 
                    </p>
                </div>

                {/* Card 3 */}
                <div className="
                    rounded-lg
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    p-4
                ">
                    <h3 className="text-sm font-semibold mb-2">
                        Recent Activity
                    </h3>
                    <p className="text-xs opacity-80">
                        Latest changes and updates
                    </p>
                </div>

            </section>
        </main>
    );
}

