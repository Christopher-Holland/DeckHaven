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
    Settings,
    HelpCircle
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
    { name: "FAQ", href: "/faq", icon: HelpCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <aside className={`
            ${isCollapsed ? "w-16" : "w-64"}
            h-full 
            bg-[var(--theme-bg)]
            text-[var(--theme-fg)]
            flex flex-col 
            border-r border-[var(--theme-border)]
            transition-all duration-300 ease-in-out
            relative
        `}>
            {/* Logo / Brand + Toggle */}
            <div
                className={`relative flex border-b border-[var(--theme-border)]
    ${isCollapsed ? "flex-col items-center gap-2 py-3" : "items-center justify-center py-4"}
  `}
            >
                {isCollapsed ? (
                    <>
                        <img
                            src="/images/DeckHaven-Shield.png"
                            alt="DeckHaven"
                            width={48}
                            height={48}
                            className="rounded-full shadow-[0_0_20px_rgba(130,102,78,0.2)] dark:shadow-[0_0_30px_rgba(66,201,156,0.35)]"
                        />
                        <button
                            onClick={toggleSidebar}
                            className="
                                h-8 w-8 shrink-0
                                rounded-lg
                                border border-[var(--theme-border)]
                                bg-[var(--theme-bg)]
                                text-[var(--theme-fg)]
                                shadow-sm
                                opacity-70 hover:opacity-100
                                hover:bg-[var(--theme-bg-elevated)]
                                transition
                                flex items-center justify-center
                            "
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <img
                            src="/images/DeckHaven-Shield.png"
                            alt="DeckHaven"
                            width={128}
                            height={128}
                            className="rounded-full shadow-[0_0_25px_rgba(130,102,78,0.25)] dark:shadow-[0_0_25px_rgba(66,201,156,0.35)]"
                        />
                        <button
                            onClick={toggleSidebar}
                            className="
                                absolute right-3 top-3 z-10
                                h-8 w-8
                                rounded-lg
                                border border-[var(--theme-border)]
                                bg-[var(--theme-bg)]
                                text-[var(--theme-fg)]
                                shadow-sm
                                opacity-70 hover:opacity-100
                                hover:bg-[var(--theme-bg-elevated)]
                                transition
                                flex items-center justify-center
                            "
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
            {/* Brand Name */}
            {!isCollapsed && (
                <div className="h-14 flex items-center justify-center px-6 border border-[var(--theme-border)]">
                    <span className="text-lg font-bold text-[var(--theme-fg)]">DeckHaven</span>
                </div>
            )}

            {/* Navigation Items */}
            <nav
                className={`flex-1 ${isCollapsed ? "px-2 py-4" : "px-3 py-4"} space-y-1`}
                aria-label="Main navigation"
            >
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
                                    ? "text-[var(--theme-fg)] shadow-[0_0_15px_var(--theme-fg)]/30"
                                    : "text-[var(--theme-fg)] hover:text-[var(--theme-fg)]"
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
                <div className="px-6 py-4 border-t border-[var(--theme-border)] text-xs text-[var(--theme-fg)] opacity-75">
                    © DeckHaven
                </div>
            )}
        </aside>
    );
}
