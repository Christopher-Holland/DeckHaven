/**
 * Theme Configuration
 * 
 * Defines base themes and accent colors for DeckHaven.
 * Users select a base theme (color scheme) and an accent color separately.
 */

export type BaseThemeId =
    | "deckhaven-light"
    | "deckhaven-dark"
    | "mtg-white"
    | "mtg-black"
    | "mtg-red"
    | "mtg-blue"
    | "mtg-green";

export type AccentColorId =
    | "emerald"
    | "bronze"
    | "gold"
    | "crimson"
    | "blue"
    | "green"
    | "purple"
    | "orange";

export interface BaseTheme {
    id: BaseThemeId;
    name: string;
    description: string;
    colors: {
        background: string;
        foreground: string;
        sidebar: string;
        card: string;
        cardBorder: string;
    };
}

export interface AccentColor {
    id: AccentColorId;
    name: string;
    description: string;
    color: string;
    hoverColor?: string;
}

export const baseThemes: Record<BaseThemeId, BaseTheme> = {
    "deckhaven-light": {
        id: "deckhaven-light",
        name: "DeckHaven - Light",
        description: "Classic light theme with warm parchment tones",
        colors: {
            background: "#f6ead6",
            foreground: "#193f44",
            sidebar: "#e8d5b8",
            card: "#ffffff",
            cardBorder: "#000000",
        },
    },
    "deckhaven-dark": {
        id: "deckhaven-dark",
        name: "DeckHaven - Dark",
        description: "Classic dark theme with deep emerald tones",
        colors: {
            background: "#0f2a2c",
            foreground: "#e8d5b8",
            sidebar: "#113033",
            card: "#1a3a3d",
            cardBorder: "#ffffff",
        },
    },
    // --- MTG-Inspired Themes (DeckHaven-style) ---
    "mtg-white": {
        id: "mtg-white",
        name: "White — Sanctum",
        description: "Bright parchment and marble tones with crisp ink contrast",
        colors: {
            background: "#f3efe6",   // warm parchment
            foreground: "#223033",   // deep ink-teal (ties to brand)
            sidebar: "#e8dfcf",      // aged paper sidebar
            card: "#fbfaf6",         // ivory card
            cardBorder: "#cbbfa9",   // soft stone border (not harsh black)
        },
    },
    "mtg-black": {
        id: "mtg-black",
        name: "Black — Obsidian",
        description: "Obsidian ink with muted bone text and antique borders",
        colors: {
            background: "#0b0f12",   // near-black with cool tint
            foreground: "#e8d5b8",   // your parchment text (brand-consistent)
            sidebar: "#0f171a",      // deep teal-black
            card: "#151d20",         // charcoal-teal surface
            cardBorder: "#2b3b3f",   // subtle slate border
        },
    },
    "mtg-red": {
        id: "mtg-red",
        name: "Red — Forge",
        description: "Heated forge tones with brighter ember highlights",
        colors: {
            background: "#2a1412",   // richer, warmer red-brown
            foreground: "#fde8e6",   // brighter parchment-pink
            sidebar: "#1f0e0c",      // deep leather
            card: "#3b1d1a",         // heated metal surface
            cardBorder: "#8a3f32",   // glowing ember edge
        },
    },
    "mtg-blue": {
        id: "mtg-blue",
        name: "Blue — Aether",
        description: "Luminous arcane blues with clearer contrast",
        colors: {
            background: "#0f1f33",   // brighter deep blue
            foreground: "#e6f2ff",   // crisp light text
            sidebar: "#0b1829",      // darker anchor
            card: "#16304a",         // arcane slate
            cardBorder: "#3a6ea5",   // energized blue edge
        },
    },
    "mtg-green": {
        id: "mtg-green",
        name: "Green — Verdant",
        description: "Living forest tones with vibrant growth energy",
        colors: {
            background: "#12261c",   // richer forest green
            foreground: "#e6f7ee",   // bright leaf-white
            sidebar: "#0d1f16",      // grounded earth
            card: "#1c3a2b",         // mossy surface
            cardBorder: "#4fa07a",   // fresh growth edge
        },
    },
};

export const accentColors: Record<AccentColorId, AccentColor> = {
    emerald: {
        id: "emerald",
        name: "Emerald",
        description: "DeckHaven signature emerald — lively but refined",
        color: "#36c293",
        hoverColor: "#42c99c",
    },
    bronze: {
        id: "bronze",
        name: "Bronze",
        description: "Antique bronze — warm, tabletop, and timeless",
        color: "#82664e",
        hoverColor: "#9d7a5f",
    },
    gold: {
        id: "gold",
        name: "Gold",
        description: "Foil gold — elegant highlight for premium accents",
        color: "#c8a94a",
        hoverColor: "#d8bd66",
    },
    crimson: {
        id: "crimson",
        name: "Crimson",
        description: "Blood crimson — strong, dramatic, readable",
        color: "#b23a48",
        hoverColor: "#cc4c5b",
    },
    blue: {
        id: "blue",
        name: "Sapphire",
        description: "Sapphire blue — crisp and arcane, not neon",
        color: "#2b6cb0",
        hoverColor: "#3a86c8",
    },
    green: {
        id: "green",
        name: "Moss",
        description: "Moss green — grounded and natural",
        color: "#2f7d57",
        hoverColor: "#3a9667",
    },
    purple: {
        id: "purple",
        name: "Amethyst",
        description: "Amethyst purple — mystical, collector-grade",
        color: "#7b4ae2",
        hoverColor: "#8d63f0",
    },
    orange: {
        id: "orange",
        name: "Ember",
        description: "Ember orange — warm pop without harshness",
        color: "#c4622d",
        hoverColor: "#d97745",
    },
};

export const defaultBaseTheme: BaseThemeId = "deckhaven-dark";
export const defaultAccentColor: AccentColorId = "bronze";

/**
 * Get the computed theme colors by combining base theme and accent color
 */
export function getThemeColors(baseThemeId: BaseThemeId, accentColorId: AccentColorId) {
    const baseTheme = baseThemes[baseThemeId];
    const accentColor = accentColors[accentColorId];

    return {
        background: baseTheme.colors.background,
        foreground: baseTheme.colors.foreground,
        accent: accentColor.color,
        accentHover: accentColor.hoverColor || accentColor.color,
        border: accentColor.color,
        sidebar: baseTheme.colors.sidebar,
        sidebarBorder: accentColor.color,
        card: baseTheme.colors.card,
        cardBorder: baseTheme.colors.cardBorder,
    };
}
