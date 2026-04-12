"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Layers,
    BookOpen,
    Swords,
    Heart,
    type LucideIcon,
} from "lucide-react";

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
    
];

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main navigation"
            className={cx(
                "fixed inset-x-0 bottom-0 z-50 lg:hidden",
                "flex items-stretch justify-around gap-0.5",
                "border-t border-[var(--theme-border)]",
                "bg-[var(--theme-bg)]/95 backdrop-blur-md",
                "px-1 pt-1",
                "pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            )}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cx(
                            "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-center transition-colors",
                            isActive
                                ? "text-[var(--theme-accent-text)] bg-[var(--theme-accent)]/15"
                                : "text-[var(--theme-fg)] opacity-70 hover:opacity-100"
                        )}
                    >
                        <Icon className="h-5 w-5 shrink-0" strokeWidth={2.75} />
                        <span className="max-w-full truncate text-[10px] font-medium leading-tight sm:text-xs">
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
