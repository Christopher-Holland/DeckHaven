/**
 * Dashboard Page
 * 
 * Displays the user's dashboard with a summary of their collection, decks, and recent activity.
 * 
 * @page
 * @route /dashboard
 */

// TODO: Figure out API to get the latest TCG News

"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "../components/SidebarContext";
import { tcgNews } from "../data/tcgNews";
import Loading from "../components/Loading";

export default function Dashboard() {
    const { isCollapsed } = useSidebar();
    const [collectionCount, setCollectionCount] = useState<number>(0);
    const [decksCount, setDecksCount] = useState<number>(0);
    const [bindersCount, setBindersCount] = useState<number>(0);
    const [wishlistCount, setWishlistCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all stats in parallel
                const [collectionRes, decksRes, bindersRes, wishlistRes] = await Promise.all([
                    fetch("/api/collection?page=1&limit=1"),
                    fetch("/api/decks"),
                    fetch("/api/binders"),
                    fetch("/api/wishlist"),
                ]);

                // Collection: get totalQuantity from pagination
                if (collectionRes.ok) {
                    const collectionData = await collectionRes.json();
                    setCollectionCount(collectionData.pagination?.totalQuantity || 0);
                }

                // Decks: count the array length
                if (decksRes.ok) {
                    const decksData = await decksRes.json();
                    setDecksCount(decksData.decks?.length || 0);
                }

                // Binders: count the array length
                if (bindersRes.ok) {
                    const bindersData = await bindersRes.json();
                    setBindersCount(bindersData.binders?.length || 0);
                }

                // Wishlist: count the array length
                if (wishlistRes.ok) {
                    const wishlistData = await wishlistRes.json();
                    setWishlistCount(wishlistData.wishlist?.length || 0);
                }
            } catch (error) {
                // Error fetching dashboard data
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <Loading />;
    }

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
                    <h3 className="text-md font-semibold mb-2 border-b border-[#42c99c] dark:border-[#82664e]">
                        My Collection
                    </h3>
                    <p className="text-xs opacity-80">
                        View and manage your cards
                    </p>
                    <p className="text-xs opacity-80 mt-2">
                        Total Cards: {collectionCount.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-80">
                        Total Decks: {decksCount}
                    </p>
                    <p className="text-xs opacity-80">
                        Total Binders: {bindersCount}
                    </p>
                    <p className="text-xs opacity-80">
                        Total Wishlist: {wishlistCount}
                    </p>
                </div>

                {/* Card 2 */}
                <div className="
                    rounded-lg
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    p-4
                ">
                    <h3 className="text-md font-semibold mb-2 border-b border-[#42c99c] dark:border-[#82664e]">
                        My Decks
                    </h3>
                    <p className="text-xs opacity-80">
                        Build and edit decks
                    </p>
                    <p className="text-xs opacity-80 mt-2">
                        You have {decksCount} {decksCount === 1 ? "deck" : "decks"}
                    </p>
                </div>

                {/* Card 3 */}
                <div className="
                    rounded-lg
                    border border-[#42c99c] dark:border-[#82664e]
                    bg-[#e8d5b8] dark:bg-[#173c3f]
                    p-4
                ">
                    <h3 className="text-md font-semibold mb-2 border-b border-[#42c99c] dark:border-[#82664e]">
                        Recent Activity
                    </h3>
                    <p className="text-xs opacity-80">
                        Latest changes and updates
                    </p>
                </div>

            </section>

            {/* TCG News */}
            <section className="mt-6">
                <div
                    className="
                    rounded-lg border border-[#42c99c] dark:border-[#82664e] 
                    bg-[#e8d5b8] dark:bg-[#173c3f] p-4"
                >
                    <div className="border-b border-[#42c99c] dark:border-[#82664e] mb-3">
                        <h3 className="flex text-md font-semibold pb-2">
                            Latest TCG News
                        </h3>
                    </div>

                    <ul className="space-y-3">
                        {tcgNews.map((news) => (
                            <li
                                key={news.id}
                                className="flex flex-col border-b border-black/10 dark:border-white/10 pb-2 last:border-none"
                            >
                                <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium hover:underline"
                                >
                                    {news.title}
                                </a>

                                <div className="flex gap-2 text-xs opacity-80 mt-1">
                                    <span>{news.source}</span>
                                    <span>•</span>
                                    <span>{news.category}</span>
                                    <span>•</span>
                                    <span>{news.publishedAt}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    );
}

