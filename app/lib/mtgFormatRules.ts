// src/lib/formatRules.ts

export type FormatCategory =
    | "Constructed"
    | "Commander-style"
    | "Limited"
    | "Variant";

export type FormatRules = {
    name: string;
    category: FormatCategory;

    /** Human-readable description */
    deckSize: string;

    /** Minimum cards (Constructed / Limited) */
    minCards?: number;

    /** Exact cards required (Commander, Brawl, etc.) */
    exactCards?: number;

    sideboard: string;
    copies: string;

    /** Commander / singleton metadata */
    singleton?: boolean;
    hasCommander?: boolean;

    /** Vintage-style restriction support */
    restrictedListPossible?: boolean;

    notes?: string[];
};

/**
 * IMPORTANT:
 * Keys should be stable + UI-safe
 * (these become your deck.format values)
 */
export const FORMAT_RULES = {
    Standard: {
        name: "Standard",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands)",
        singleton: false,
        hasCommander: false,
        notes: ["Rotating format (card pool changes over time)."],
    },

    Pioneer: {
        name: "Pioneer",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        singleton: false,
        hasCommander: false,
        copies: "Up to 4 copies (except basic lands)",
    },

    Modern: {
        name: "Modern",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        singleton: false,
        hasCommander: false,
        copies: "Up to 4 copies (except basic lands)",
    },

    Legacy: {
        name: "Legacy",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands); banned list applies",
        singleton: false,
        hasCommander: false,
        notes: ["Some formats have a restricted list—Vintage is the main one."],
    },

    Vintage: {
        name: "Vintage",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands); some cards restricted to 1",
        singleton: false,
        hasCommander: false,
        restrictedListPossible: true,
    },

    Pauper: {
        name: "Pauper",
        category: "Constructed",
        deckSize: "60 cards minimum",
        minCards: 60,
        sideboard: "Up to 15",
        copies: "Up to 4 copies (except basic lands)",
        singleton: false,
        hasCommander: false,
        notes: ["Card pool restriction: commons only (per format legality)."],
    },

    Commander: {
        name: "Commander",
        category: "Commander-style",
        deckSize: "Exactly 100 cards (including Commander)",
        exactCards: 100,
        sideboard: "None / Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: true,
        notes: [
            "Includes 1 Commander (shown separately from main deck).",
            "Singleton format: Maximum 1 copy of each card except basic lands.",
            "Basic lands (Plains, Island, Swamp, Mountain, Forest) can have multiple copies.",
            "Commander color identity rules apply.",
        ],
    },

    Brawl: {
        name: "Brawl",
        category: "Commander-style",
        deckSize: "60 cards (including Commander)",
        exactCards: 60,
        sideboard: "None / Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: true,
        notes: ["Uses a Standard-legal card pool (in paper)."],
    },

    "Historic Brawl": {
        name: "Historic Brawl",
        category: "Commander-style",
        deckSize: "100 cards (including Commander)",
        exactCards: 100,
        sideboard: "None / Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: true,
        notes: ["Arena format (digital)."],
    },

    Oathbreaker: {
        name: "Oathbreaker",
        category: "Commander-style",
        deckSize: "60 cards (includes Oathbreaker + Signature Spell)",
        exactCards: 60,
        sideboard: "None / Not typical",
        copies: "Singleton (1 of each, except basic lands)",
        singleton: true,
        hasCommander: false,
        notes: [
            "Includes 1 Oathbreaker (a planeswalker) + 1 Signature Spell.",
        ],
    },

    Draft: {
        name: "Draft",
        category: "Limited",
        deckSize: "40 cards minimum",
        minCards: 40,
        sideboard: "All unused cards",
        copies: "No copy limit (you can play any number you drafted)",
        singleton: false,
        hasCommander: false,
        notes: ["Built during the event from drafted cards."],
    },

    Sealed: {
        name: "Sealed",
        category: "Limited",
        deckSize: "40 cards minimum",
        minCards: 40,
        sideboard: "All unused cards",
        copies: "No copy limit (any number from your sealed pool)",
        singleton: false,
        hasCommander: false,
        notes: ["Built during the event from your sealed pool."],
    },

    "Two-Headed Giant": {
        name: "Two-Headed Giant",
        category: "Variant",
        deckSize:
            "Depends on underlying format (often 60+ Constructed or 40+ Limited)",
        sideboard: "Depends on underlying format",
        copies: "Depends on underlying format",
        singleton: false,
        hasCommander: false,
        notes: ["Team format—deck rules come from the format being played."],
    },

    Planechase: {
        name: "Planechase",
        category: "Variant",
        deckSize: "Uses underlying format rules",
        sideboard: "Depends on underlying format",
        copies: "Depends on underlying format",
        singleton: false,
        hasCommander: false,
        notes: ["Planes deck is separate from your main deck."],
    },

    Archenemy: {
        name: "Archenemy",
        category: "Variant",
        deckSize: "Uses underlying format rules",
        sideboard: "Depends on underlying format",
        copies: "Depends on underlying format",
        singleton: false,
        hasCommander: false,
        notes: ["Scheme deck is separate from your main deck."],
    },
} as const;

/** Union of all valid format keys */
export type FormatKey = keyof typeof FORMAT_RULES;