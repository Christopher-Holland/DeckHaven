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

type LayoutWrapperProps = {
    children: React.ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";
    
    // Auth routes that should not show sidebar/navbar
    const isAuthRoute = pathname.startsWith("/auth/") || pathname.startsWith("/handler/");

    // Render minimal layout for landing page and auth routes
    if (isLandingPage || isAuthRoute) {
        return (
            <div className="flex-1 w-full">
                {children}
            </div>
        );
    }

    // Render full layout with sidebar and navigation for all other pages
    return (
        <>
            <Sidebar />
            <div className="flex flex-col flex-1 transition-all duration-300">
                <Navbar />
                <BrandNav />
                <main className="flex-1 overflow-y-auto p-0 min-h-0 transition-all duration-300">
                    {children}
                </main>
            </div>
        </>
    );
}
