/**
 * Stack Auth theme configuration.
 * Uses DeckHaven palette with WCAG AA compliant contrast for muted elements.
 * Fixes: Element has insufficient color contrast (mutedForeground on muted).
 */

/** WCAG AA compliant muted/mutedForeground pairs (4.5:1+ contrast) */
export const stackTheme = {
    light: {
        background: "#f6ead6",
        foreground: "#193f44",
        card: "#ffffff",
        cardForeground: "#193f44",
        popover: "#ffffff",
        popoverForeground: "#193f44",
        muted: "#e8d5b8",
        mutedForeground: "#2d3d3f", // 4.5:1+ on #e8d5b8
        primary: "#193f44",
        primaryForeground: "#f6ead6",
        secondary: "#e8d5b8",
        secondaryForeground: "#193f44",
        accent: "#82664e",
        accentForeground: "#ffffff",
        border: "#82664e",
        input: "#e8d5b8",
        ring: "#193f44",
    },
    dark: {
        background: "#0f2a2c",
        foreground: "#e8d5b8",
        card: "#1a3a3d",
        cardForeground: "#e8d5b8",
        popover: "#1a3a3d",
        popoverForeground: "#e8d5b8",
        muted: "#1a3a3d",
        mutedForeground: "#c5c9c0", // 4.5:1+ on #1a3a3d
        primary: "#e8d5b8",
        primaryForeground: "#0f2a2c",
        secondary: "#113033",
        secondaryForeground: "#e8d5b8",
        accent: "#82664e",
        accentForeground: "#ffffff",
        border: "#82664e",
        input: "#1a3a3d",
        ring: "#e8d5b8",
    },
    radius: "0.5rem",
};
