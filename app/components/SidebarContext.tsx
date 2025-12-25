/**
 * Sidebar Context Provider
 * 
 * Provides global state management for the sidebar's collapsed/expanded state.
 * Persists the sidebar state to localStorage so it persists across page reloads.
 * 
 * @module components/SidebarContext
 * @example
 * // Wrap your app with SidebarProvider
 * <SidebarProvider>
 *   <App />
 * </SidebarProvider>
 * 
 * // Use in components
 * const { isCollapsed, toggleSidebar } = useSidebar();
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
    /** Whether the sidebar is currently collapsed */
    isCollapsed: boolean;
    /** Function to toggle the sidebar's collapsed state */
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = "deckhaven-sidebar-collapsed";

/**
 * Sidebar Provider Component
 * 
 * Manages sidebar state and persists it to localStorage.
 * Handles hydration to prevent SSR/client mismatch.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load saved state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (savedState !== null) {
            setIsCollapsed(savedState === "true");
        }
        setIsHydrated(true);
    }, []);

    // Save state to localStorage whenever it changes (after hydration)
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
        }
    }, [isCollapsed, isHydrated]);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

/**
 * Hook to access sidebar context
 * 
 * @returns Sidebar context with isCollapsed and toggleSidebar
 * @throws Error if used outside of SidebarProvider
 */
export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
