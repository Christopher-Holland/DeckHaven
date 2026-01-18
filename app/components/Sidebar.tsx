/**
 * Sidebar Navigation Component
 * 
 * Collapsible sidebar navigation menu with main app navigation links.
 * Supports collapsing/expanding with state persisted to localStorage.
 * Displays app logo and navigation items with active state highlighting.
 * 
 * @component
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Layers,
    FolderOpen,
    BookOpen,
    Library,
    Swords,
    Heart,
    Settings
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import type { LucideIcon } from "lucide-react";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sets", href: "/sets", icon: BookOpen },
    { name: "Collection", href: "/collection", icon: Layers },
    { name: "Decks", href: "/decks", icon: Swords },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <aside className={`
            ${isCollapsed ? "w-16" : "w-64"}
            h-full 
            bg-[#e8d5b8] dark:bg-[#113033] 
            text-gray-900 dark:text-gray-100 
            flex flex-col 
            border-r border-[#42c99c] dark:border-[#82664e]
            transition-all duration-300 ease-in-out
            relative
        `}>
            {/* Collapse Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="
                    absolute -right-3 top-20
                    z-50
                    w-6 h-6
                    rounded-full
                    bg-[#42c99c] dark:bg-[#82664e]
                    text-white
                    flex items-center justify-center
                    shadow-lg
                    hover:bg-[#36c293] dark:hover:bg-[#9d7a5f]
                    transition-colors
                "
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            {/* Logo / Brand */}
            <div className={`flex items-center justify-center ${isCollapsed ? "py-2" : "py-4"}`}>
                {isCollapsed ? (
                    <img
                        src="/images/DeckHaven-Shield.png"
                        alt="DeckHaven"
                        width={48}
                        height={48}
                        className="rounded-full shadow-[0_0_20px_rgba(130,102,78,0.2)] dark:shadow-[0_0_30px_rgba(66,201,156,0.35)]"
                    />
                ) : (
                    <img
                        src="/images/DeckHaven-Shield.png"
                        alt="DeckHaven"
                        width={128}
                        height={128}
                        className="rounded-full shadow-[0_0_25px_rgba(130,102,78,0.25)] dark:shadow-[0_0_25px_rgba(66,201,156,0.35)]"
                    />
                )}
            </div>

            {/* Brand Name */}
            {!isCollapsed && (
                <div className="h-14 flex items-center justify-center px-6 border-b border-[#42c99c] dark:border-[#82664e]">
                    <span className="text-lg font-bold text-[#42c99c] dark:text-[#e8d5b8]">DeckHaven</span>
                </div>
            )}

            {/* Navigation Items */}
            <nav className={`flex-1 ${isCollapsed ? "px-2 py-4" : "px-3 py-4"} space-y-1`}>
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                                // Prevent sidebar from toggling when clicking nav items
                                e.stopPropagation();
                            }}
                            className={`
                                block 
                                ${isCollapsed ? "px-2 py-3" : "px-3 py-2"} 
                                rounded-md 
                                text-sm font-medium 
                                transition-all duration-200
                                ${isCollapsed ? "flex items-center justify-center" : "flex items-center gap-3"}
                                ${isActive
                                    ? "text-[#42c99c] dark:text-[#e8d5b8] shadow-[0_0_15px_rgba(130,102,78,0.2)] dark:shadow-[0_0_15px_rgba(66,201,156,0.3)]"
                                    : "text-[#113033] dark:text-[#e8d5b8] hover:text-[#36c293] dark:hover:text-[#36c293]"
                                }
                            `}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={isCollapsed ? "w-5 h-5" : "w-4 h-4"} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="px-6 py-4 border-t border-[#42c99c] dark:border-[#82664e] text-xs text-[#42c99c] dark:text-[#82664e]">
                    © DeckHaven
                </div>
            )}
        </aside>
    );
}
