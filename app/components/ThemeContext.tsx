/**
 * Theme Context
 * 
 * Manages DeckHaven theme selection and applies theme colors via CSS variables.
 * Separates base theme (color scheme) from accent color selection.
 * Persists theme preference to localStorage.
 */

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
    baseThemes, 
    accentColors, 
    type BaseThemeId, 
    type AccentColorId,
    defaultBaseTheme,
    defaultAccentColor,
    getThemeColors
} from "@/app/lib/themes";
import { logger } from "@/app/lib/logger";

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
    const [baseTheme, setBaseThemeState] = useState<BaseThemeId>(defaultBaseTheme);
    const [accentColor, setAccentColorState] = useState<AccentColorId>(defaultAccentColor);
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedBaseTheme = localStorage.getItem("deckhaven-base-theme") as BaseThemeId;
        const savedAccentColor = localStorage.getItem("deckhaven-accent-color") as AccentColorId;
        
        if (savedBaseTheme && baseThemes[savedBaseTheme]) {
            setBaseThemeState(savedBaseTheme);
        }
        if (savedAccentColor && accentColors[savedAccentColor]) {
            setAccentColorState(savedAccentColor);
        }
    }, []);

    // Compute theme colors from base theme + accent color
    const themeColors = getThemeColors(baseTheme, accentColor);

    // Apply theme colors to CSS variables
    useEffect(() => {
        if (!mounted) return;
        
        const root = document.documentElement;
        
        // Set CSS variables for theme colors
        root.style.setProperty("--theme-bg", themeColors.background);
        root.style.setProperty("--theme-fg", themeColors.foreground);
        root.style.setProperty("--theme-accent", themeColors.accent);
        root.style.setProperty("--theme-accent-hover", themeColors.accentHover);
        root.style.setProperty("--theme-border", themeColors.border);
        root.style.setProperty("--theme-sidebar", themeColors.sidebar);
        root.style.setProperty("--theme-sidebar-border", themeColors.sidebarBorder);
        root.style.setProperty("--theme-card", themeColors.card);
        root.style.setProperty("--theme-card-border", themeColors.cardBorder);
        
        // Also set data attributes for potential CSS selectors
        root.setAttribute("data-base-theme", baseTheme);
        root.setAttribute("data-accent-color", accentColor);
    }, [baseTheme, accentColor, themeColors, mounted]);

    const setBaseTheme = (themeId: BaseThemeId) => {
        if (!baseThemes[themeId]) {
            logger.warn(`Base theme ${themeId} not found, using default`);
            setBaseThemeState(defaultBaseTheme);
            localStorage.setItem("deckhaven-base-theme", defaultBaseTheme);
            return;
        }
        setBaseThemeState(themeId);
        localStorage.setItem("deckhaven-base-theme", themeId);
    };

    const setAccentColor = (colorId: AccentColorId) => {
        if (!accentColors[colorId]) {
            logger.warn(`Accent color ${colorId} not found, using default`);
            setAccentColorState(defaultAccentColor);
            localStorage.setItem("deckhaven-accent-color", defaultAccentColor);
            return;
        }
        setAccentColorState(colorId);
        localStorage.setItem("deckhaven-accent-color", colorId);
    };

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
