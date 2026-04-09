/**
 * Layout Wrapper Component
 * 
 * Conditionally renders the full app layout (Sidebar, Navbar, BrandNav) or
 * a minimal layout for the landing page. This allows the home page to have
 * a different layout structure than the rest of the application.
 * 
 * @component
 */

"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BrandNav from "./BrandNav";
import { MobileNav } from "./Drawer/MobileNav";

type LayoutWrapperProps = {
    children: React.ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";
    
    // Auth routes that should not show sidebar/navbar
    const isAuthRoute = pathname.startsWith("/auth/") || pathname.startsWith("/handler/");
    
    // Binder page route - full screen without navigation
    const isBinderPage = pathname.startsWith("/collection/binders/") && pathname !== "/collection/binders";

    // Render minimal layout for landing page, auth routes, and binder pages
    if (isLandingPage || isAuthRoute || isBinderPage) {
        return (
            <div className="flex-1 w-full">
                {children}
            </div>
        );
    }

    // Full layout: sidebar (desktop only) + top nav; bottom tab bar on mobile only (see MobileNav)
    return (
        <>
            <Sidebar />
            <div className="relative flex min-w-0 flex-1 flex-col transition-all duration-300 lg:min-h-0">
                <Navbar />
                <BrandNav />
                <main className="flex-1 overflow-y-auto p-0 min-h-0 bg-[var(--theme-bg)] text-[var(--theme-fg)] transition-all duration-300 pb-[max(4.75rem,env(safe-area-inset-bottom)+3.5rem)] lg:pb-0">
                    {children}
                </main>
                <MobileNav />
            </div>
        </>
    );
}
