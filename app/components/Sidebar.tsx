// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Sets", href: "/sets" },
    { name: "Cards", href: "/cards" },
    { name: "Collection", href: "/collection" },
    { name: "Decks", href: "/decks" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-full bg-[#e8d5b8] dark:bg-[#113033] text-gray-900 dark:text-gray-100 flex flex-col border-r border-[#42c99c] dark:border-[#82664e]">
            {/* Logo / Brand */}
            <div className="flex items-center justify-center">
                <img src="/images/DeckHaven-Shield.png" alt="DeckHaven" width={128} height={128} className="shadow-lg rounded-full" />
            </div>
                <div className="h-14 flex items-center justify-center px-6 border-b border-[#42c99c] dark:border-[#82664e]">
                <span className="text-lg font-bold text-gray-900 dark:text-white">DeckHaven</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition
                ${isActive
                                    ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                }
              `}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#42c99c] dark:border-[#82664e] text-xs text-gray-500 dark:text-gray-500">
                © DeckHaven
            </div>
        </aside>
    );
}