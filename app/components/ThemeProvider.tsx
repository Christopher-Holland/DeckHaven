/**
 * Theme Provider Component
 * 
 * Wraps the application with next-themes ThemeProvider to enable
 * dark mode functionality. Persists theme preference to localStorage.
 * 
 * @component
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode } from "react";

type ThemeProviderProps = {
    children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            storageKey="deckhaven-theme"
            disableTransitionOnChange={false}
        >
            {children}
        </NextThemesProvider>
    );
}
