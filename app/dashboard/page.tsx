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
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Layers,
    Library,
    Swords,
    RefreshCcw,
    ArrowRight,
} from "lucide-react";

import Loading from "../components/Loading";
import { tcgNews } from "../data/tcgNews";

type Deck = {
    id: string;
    name: string;
    _count?: {
        deckCards: number;
    };
};

export default function Dashboard() {
    const router = useRouter();

    const [collectionCount, setCollectionCount] = useState<number>(0);
    const [decksCount, setDecksCount] = useState<number>(0);
    const [bindersCount, setBindersCount] = useState<number>(0);
    const [wishlistCount, setWishlistCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [deckNames, setDeckNames] = useState<Deck[]>([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all stats in parallel
            const [collectionRes, decksRes, bindersRes, wishlistRes] = await Promise.all([
                fetch("/api/collection?page=1&limit=1", { cache: "no-store" }),
                fetch("/api/decks", { cache: "no-store" }),
                fetch("/api/binders", { cache: "no-store" }),
                fetch("/api/wishlist", { cache: "no-store" }),
            ]);

            // Collection: get totalQuantity from pagination
            if (collectionRes.ok) {
                const collectionData = await collectionRes.json();
                setCollectionCount(collectionData.pagination?.totalQuantity || 0);
            }

            // Decks: get count and names
            if (decksRes.ok) {
                const decksData = await decksRes.json();
                const decks: Deck[] = decksData.decks || [];
                setDecksCount(decks.length);
                setDeckNames(decks.slice(0, 5));
            }

            // Binders: count the array length
            if (bindersRes.ok) {
                const bindersData = await bindersRes.json();
                const binders = Array.isArray(bindersData.binders)
                    ? bindersData.binders
                    : Array.isArray(bindersData)
                        ? bindersData
                        : [];
                setBindersCount(binders.length);
            }

            // Wishlist: count the array length
            if (wishlistRes.ok) {
                const wishlistData = await wishlistRes.json();
                setWishlistCount(wishlistData.wishlist?.length || 0);
            }
        } catch {
            // Keep silent for v1.0, or add toast later
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <Loading />;

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
            {/* Header */}
            <section className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-2xl font-semibold">Dashboard</h2>
                    <p className="text-sm opacity-80 mt-1">
                        Your collection, decks, and progress at a glance.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboardData}
                    className="
            inline-flex items-center gap-2
            px-3 py-2 rounded-md text-sm
            bg-[#e8d5b8] dark:bg-[#173c3f]
            border border-[#42c99c] dark:border-[#82664e]
            hover:bg-black/10 dark:hover:bg-white/10
            transition-colors
            flex-shrink-0
          "
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </button>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <ActionCard
                    title="Browse Sets"
                    subtitle="Find sets and start tracking."
                    icon={<BookOpen className="w-5 h-5" />}
                    onClick={() => router.push("/sets/browse")}
                />
                <ActionCard
                    title="Collection"
                    subtitle="View and manage your cards."
                    icon={<Layers className="w-5 h-5" />}
                    onClick={() => router.push("/collection")}
                />
                <ActionCard
                    title="Binders"
                    subtitle="Organize like IRL."
                    icon={<Library className="w-5 h-5" />}
                    onClick={() => router.push("/collection/binders")}
                />
                <ActionCard
                    title="Decks"
                    subtitle="Build and refine decks."
                    icon={<Swords className="w-5 h-5" />}
                    onClick={() => router.push("/decks")}
                />
            </section>

            {/* Snapshot */}
            <section className="mb-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold">Snapshot</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Cards" value={collectionCount.toLocaleString()} />
                    <StatCard label="Decks" value={`${decksCount}`} />
                    <StatCard label="Binders" value={`${bindersCount}`} />
                    <StatCard label="Wishlist" value={`${wishlistCount}`} />
                </div>
            </section>

            {/* Secondary Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-6">
                {/* Left column stack */}
                <div className="flex flex-col gap-6">
                    {/* My Decks */}
                    <div
                        className="
      rounded-lg
      border border-[#42c99c] dark:border-[#82664e]
      bg-[#e8d5b8] dark:bg-[#173c3f]
      p-4
    "
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-[#42c99c] dark:border-[#82664e] pb-2 mb-3">
                            <h3 className="text-md font-semibold">My Decks</h3>
                            <Link href="/decks" className="text-xs opacity-80 hover:opacity-100 hover:underline">
                                View all
                            </Link>
                        </div>

                        <p className="text-xs opacity-80">
                            You have {decksCount} {decksCount === 1 ? "deck" : "decks"}.
                        </p>

                        {deckNames.length > 0 ? (
                            <div className="mt-3 space-y-1">
                                {deckNames.slice(0, 3).map((deck) => (
                                    <Link
                                        key={deck.id}
                                        href={`/decks/${deck.id}`}
                                        className="block text-xs opacity-90 hover:opacity-100 hover:underline transition-opacity"
                                    >
                                        {deck.name}
                                        {typeof deck._count?.deckCards === "number" ? (
                                            <span className="opacity-70"> • {deck._count.deckCards} cards</span>
                                        ) : null}
                                    </Link>
                                ))}
                                {decksCount > 3 && (
                                    <Link
                                        href="/decks"
                                        className="block text-xs opacity-70 hover:opacity-100 hover:underline transition-opacity italic mt-1"
                                    >
                                        + {decksCount - 3} more...
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="mt-3 text-xs opacity-80">
                                No decks yet.{" "}
                                <Link href="/decks" className="underline underline-offset-4 hover:opacity-100">
                                    Create one
                                </Link>
                                .
                            </div>
                        )}
                    </div>

                    {/* My Binders */}
                    <div
                        className="
      rounded-lg
      border border-[#42c99c] dark:border-[#82664e]
      bg-[#e8d5b8] dark:bg-[#173c3f]
      p-4
    "
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-[#42c99c] dark:border-[#82664e] pb-2 mb-3">
                            <h3 className="text-md font-semibold">My Binders</h3>
                            <Link href="/collection/binders" className="text-xs opacity-80 hover:opacity-100 hover:underline">
                                View all
                            </Link>
                        </div>

                        <p className="text-xs opacity-80">
                            You have {bindersCount} {bindersCount === 1 ? "binder" : "binders"}.
                        </p>

                        <div className="mt-3">
                            <Link
                                href="/collection/binders"
                                className="
          inline-flex items-center gap-2
          text-xs opacity-90
          hover:opacity-100 hover:underline
        "
                            >
                                Open Binders <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity (v1.0-friendly) */}
                <div
                    className="
            rounded-lg
            border border-[#42c99c] dark:border-[#82664e]
            bg-[#e8d5b8] dark:bg-[#173c3f]
            p-4
          "
                >
                    <div className="border-b border-[#42c99c] dark:border-[#82664e] pb-2 mb-3">
                        <h3 className="text-md font-semibold">Recent Activity</h3>
                    </div>

                    <p className="text-xs opacity-80">
                        Coming soon: recent adds, binder changes, and deck edits.
                    </p>

                    <div className="mt-4">
                        <Link
                            href="/collection"
                            className="
                inline-flex items-center gap-2
                text-xs opacity-90
                hover:opacity-100 hover:underline
              "
                        >
                            Go to Collection <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Latest TCG News */}
                <div
                    className="
            rounded-lg border border-[#42c99c] dark:border-[#82664e]
            bg-[#e8d5b8] dark:bg-[#173c3f] p-4
          "
                >
                <div className="border-b border-[#42c99c] dark:border-[#82664e] mb-3">
                    <h3 className="text-md font-semibold pb-2">Latest TCG News</h3>
                </div>

                <ul className="space-y-3">
                    {tcgNews.slice(0, 5).map((news) => (
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

                            <div className="flex flex-wrap gap-2 text-xs opacity-80 mt-1">
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

function ActionCard({
    title,
    subtitle,
    icon,
    onClick,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
        text-left
        rounded-lg
        border border-[#42c99c] dark:border-[#82664e]
        bg-[#e8d5b8] dark:bg-[#173c3f]
        p-4
        hover:bg-black/10 dark:hover:bg-white/10
        transition-colors
      "
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm opacity-70 mt-1">{subtitle}</p>
                </div>
                <div className="opacity-90">{icon}</div>
            </div>
        </button>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div
            className="
        rounded-lg
        border border-[#42c99c] dark:border-[#82664e]
        bg-[#e8d5b8] dark:bg-[#173c3f]
        p-4
      "
        >
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-3xl font-semibold mt-2">{value}</p>
        </div>
    );
}