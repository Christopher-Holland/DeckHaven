/**
 * Theme Context
 *
 * Manages DeckHaven theme selection and applies theme colors via CSS variables.
 * Persists to localStorage (immediate) and to UserSettings via API when logged in,
 * so preferences survive devices and clearing localStorage.
 */

"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
    baseThemes,
    accentColors,
    type BaseThemeId,
    type AccentColorId,
    defaultBaseTheme,
    defaultAccentColor,
    getThemeColors,
} from "@/app/lib/themes";
import { logger } from "@/app/lib/logger";
import { useUser } from "@stackframe/stack";

interface ThemeContextType {
    baseTheme: BaseThemeId;
    accentColor: AccentColorId;
    setBaseTheme: (themeId: BaseThemeId) => void;
    setAccentColor: (colorId: AccentColorId) => void;
    themeColors: ReturnType<typeof getThemeColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useDeckHavenTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useDeckHavenTheme must be used within DeckHavenThemeProvider");
    }
    return context;
}

export function DeckHavenThemeProvider({ children }: { children: ReactNode }) {
    const user = useUser();
    const [baseTheme, setBaseThemeState] = useState<BaseThemeId>(defaultBaseTheme);
    const [accentColor, setAccentColorState] = useState<AccentColorId>(defaultAccentColor);
    const [mounted, setMounted] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Load from localStorage on mount (immediate), then from API when user is available
    useEffect(() => {
        setMounted(true);
        const savedBase = localStorage.getItem("deckhaven-base-theme") as BaseThemeId | null;
        const savedAccent = localStorage.getItem("deckhaven-accent-color") as AccentColorId | null;
        if (savedBase && baseThemes[savedBase]) setBaseThemeState(savedBase);
        if (savedAccent && accentColors[savedAccent]) setAccentColorState(savedAccent);
    }, []);

    // When user logs out, allow next fetch when they log back in
    useEffect(() => {
        if (!user) setSettingsLoaded(false);
    }, [user]);

    // When user is logged in, fetch settings from API and override (server wins)
    useEffect(() => {
        if (!user || settingsLoaded) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/user/settings", { cache: "no-store" });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                const serverTheme = data.theme as BaseThemeId;
                const serverAccent = data.accent as AccentColorId;
                if (serverTheme && baseThemes[serverTheme]) {
                    setBaseThemeState(serverTheme);
                    if (typeof localStorage !== "undefined") localStorage.setItem("deckhaven-base-theme", serverTheme);
                }
                if (serverAccent && accentColors[serverAccent]) {
                    setAccentColorState(serverAccent);
                    if (typeof localStorage !== "undefined") localStorage.setItem("deckhaven-accent-color", serverAccent);
                }
            } catch {
                // Keep localStorage values
            } finally {
                if (!cancelled) setSettingsLoaded(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const persistToApi = useCallback(async (theme: BaseThemeId, accent: AccentColorId) => {
        try {
            await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme, accent }),
            });
        } catch (e) {
            logger.warn("Failed to persist theme to server", e);
        }
    }, []);

    // Compute theme colors and apply to document
    const themeColors = getThemeColors(baseTheme, accentColor);
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        root.style.setProperty("--theme-bg", themeColors.background);
        root.style.setProperty("--theme-fg", themeColors.foreground);
        root.style.setProperty("--theme-accent", themeColors.accent);
        root.style.setProperty("--theme-accent-hover", themeColors.accentHover);
        root.style.setProperty("--theme-border", themeColors.border);
        root.style.setProperty("--theme-sidebar", themeColors.sidebar);
        root.style.setProperty("--theme-sidebar-border", themeColors.sidebarBorder);
        root.style.setProperty("--theme-card", themeColors.card);
        root.style.setProperty("--theme-card-border", themeColors.cardBorder);
        root.setAttribute("data-base-theme", baseTheme);
        root.setAttribute("data-accent-color", accentColor);
    }, [baseTheme, accentColor, themeColors, mounted]);

    const setBaseTheme = useCallback((themeId: BaseThemeId) => {
        if (!baseThemes[themeId]) {
            logger.warn(`Base theme ${themeId} not found, using default`);
            setBaseThemeState(defaultBaseTheme);
            localStorage.setItem("deckhaven-base-theme", defaultBaseTheme);
            if (user) persistToApi(defaultBaseTheme, accentColor);
            return;
        }
        setBaseThemeState(themeId);
        localStorage.setItem("deckhaven-base-theme", themeId);
        if (user) persistToApi(themeId, accentColor);
    }, [user, accentColor, persistToApi]);

    const setAccentColor = useCallback((colorId: AccentColorId) => {
        if (!accentColors[colorId]) {
            logger.warn(`Accent color ${colorId} not found, using default`);
            setAccentColorState(defaultAccentColor);
            localStorage.setItem("deckhaven-accent-color", defaultAccentColor);
            if (user) persistToApi(baseTheme, defaultAccentColor);
            return;
        }
        setAccentColorState(colorId);
        localStorage.setItem("deckhaven-accent-color", colorId);
        if (user) persistToApi(baseTheme, colorId);
    }, [user, baseTheme, persistToApi]);

    return (
        <ThemeContext.Provider
            value={{
                baseTheme,
                accentColor,
                setBaseTheme,
                setAccentColor,
                themeColors,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
