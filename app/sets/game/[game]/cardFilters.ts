/**
 * Card Filter Options and Types
 * 
 * This module contains all filter-related types, constants, and utilities
 * for filtering cards in the card browsing interface. Filters are organized
 * by game type (MTG, Pokémon, Yu-Gi-Oh!) with game-specific options where applicable.
 */

// ============================================================================
// Filter Type Definitions
// ============================================================================

/**
 * Filter for showing cards based on ownership/favorite status
 */
export type ShowFilter = "all" | "owned" | "favorited";

/**
 * Options for sorting cards
 */
export type SortBy = "az" | "za" | "newest" | "oldest" | "mostOwned";

/**
 * Rarity filter - flexible to support different game rarities
 */
export type RarityFilter = "all" | string;

/**
 * Type filter - flexible to support different card types across games
 */
export type TypeFilter = "all" | string;

/**
 * Mana color filter - specific to Magic The Gathering
 */
export type ManaColorFilter = "all" | "white" | "blue" | "black" | "red" | "green" | "colorless" | "multicolor";

/**
 * Keyword filter - specific to Magic The Gathering
 */
export type KeywordFilter = "all" | string;

// ============================================================================
// Filter Option Constants
// ============================================================================

/**
 * Filter option structure for dropdown selects
 */
export type FilterOption = {
    value: string;
    label: string;
};

/**
 * Rarity options organized by game type
 * Each game has its own set of rarity classifications
 */
export const RARITY_OPTIONS: Record<string, FilterOption[]> = {
    mtg: [
        { value: "all", label: "All" },
        { value: "common", label: "Common" },
        { value: "uncommon", label: "Uncommon" },
        { value: "rare", label: "Rare" },
        { value: "mythic", label: "Mythic Rare" },
        { value: "special", label: "Special" }, // bonus / flexible bucket
    ],
    ptcg: [
        { value: "all", label: "All" },
        { value: "common", label: "Common" },
        { value: "uncommon", label: "Uncommon" },
        { value: "rare", label: "Rare" },
        { value: "double_rare", label: "Double Rare" },
        { value: "ultra_rare", label: "Ultra Rare" },
        { value: "illustration_rare", label: "Illustration Rare" },
        { value: "special_illustration_rare", label: "Special Illustration Rare" },
        { value: "hyper_rare", label: "Hyper Rare" },
        { value: "promo", label: "Promo" },
    ],
    ytcg: [
        { value: "all", label: "All" },
        { value: "common", label: "Common" },
        { value: "rare", label: "Rare" },
        { value: "super_rare", label: "Super Rare" },
        { value: "ultra_rare", label: "Ultra Rare" },
        { value: "secret_rare", label: "Secret Rare" },
        { value: "ultimate_rare", label: "Ultimate Rare" },
        { value: "ghost_rare", label: "Ghost Rare" },
        { value: "starlight_rare", label: "Starlight Rare" },
    ],
};

/**
 * Card type options organized by game type
 * Each game has different card type classifications
 */
export const TYPE_OPTIONS: Record<string, FilterOption[]> = {
    mtg: [
        { value: "all", label: "All" },
        { value: "creature", label: "Creature" },
        { value: "instant", label: "Instant" },
        { value: "sorcery", label: "Sorcery" },
        { value: "artifact", label: "Artifact" },
        { value: "enchantment", label: "Enchantment" },
        { value: "planeswalker", label: "Planeswalker" },
        { value: "land", label: "Land" },
        { value: "battle", label: "Battle" },
    ],
    ptcg: [
        { value: "all", label: "All" },
        { value: "pokemon", label: "Pokémon" },
        { value: "trainer", label: "Trainer" },
        { value: "item", label: "Item" },
        { value: "supporter", label: "Supporter" },
        { value: "stadium", label: "Stadium" },
        { value: "tool", label: "Pokémon Tool" },
        { value: "energy", label: "Energy" },
        { value: "special_energy", label: "Special Energy" },
    ],
    ytcg: [
        { value: "all", label: "All" },
        { value: "monster", label: "Monster" },
        { value: "spell", label: "Spell" },
        { value: "trap", label: "Trap" },
        { value: "fusion", label: "Fusion" },
        { value: "synchro", label: "Synchro" },
        { value: "xyz", label: "Xyz" },
        { value: "link", label: "Link" },
        { value: "ritual", label: "Ritual" },
    ],
};

/**
 * Mana color options - Magic The Gathering specific
 * Represents the five colors of mana plus colorless and multicolor
 */
export const MANA_COLOR_OPTIONS: Array<{ value: ManaColorFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "white", label: "White" },
    { value: "blue", label: "Blue" },
    { value: "black", label: "Black" },
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "colorless", label: "Colorless" },
    { value: "multicolor", label: "Multicolor" },
];

/**
 * Keyword options - Magic The Gathering specific
 * Contains commonly searched keywords and abilities organized by category
 */
export const KEYWORD_OPTIONS: Array<{ value: KeywordFilter; label: string }> = [
    { value: "all", label: "All" },

    // Evergreen combat / abilities
    { value: "flying", label: "Flying" },
    { value: "trample", label: "Trample" },
    { value: "haste", label: "Haste" },
    { value: "lifelink", label: "Lifelink" },
    { value: "deathtouch", label: "Deathtouch" },
    { value: "vigilance", label: "Vigilance" },
    { value: "first-strike", label: "First Strike" },
    { value: "double-strike", label: "Double Strike" },
    { value: "menace", label: "Menace" },
    { value: "reach", label: "Reach" },

    // Protection / survivability
    { value: "hexproof", label: "Hexproof" },
    { value: "ward", label: "Ward" },
    { value: "indestructible", label: "Indestructible" },
    { value: "protection", label: "Protection" },

    // Casting / timing
    { value: "flash", label: "Flash" },
    { value: "cycling", label: "Cycling" },
    { value: "kicker", label: "Kicker" },
    { value: "flashback", label: "Flashback" },
    { value: "foretell", label: "Foretell" },
    { value: "suspend", label: "Suspend" },

    // Spell mechanics
    { value: "prowess", label: "Prowess" },
    { value: "cascade", label: "Cascade" },
    { value: "convoke", label: "Convoke" },
    { value: "delve", label: "Delve" },
    { value: "storm", label: "Storm" },
    { value: "overload", label: "Overload" },

    // Graveyard / recursion
    { value: "undying", label: "Undying" },
    { value: "persist", label: "Persist" },
    { value: "escape", label: "Escape" },
    { value: "unearth", label: "Unearth" },
    { value: "dredge", label: "Dredge" },

    // Board / synergy mechanics
    { value: "landfall", label: "Landfall" },
    { value: "exploit", label: "Exploit" },
    { value: "populate", label: "Populate" },
    { value: "proliferate", label: "Proliferate" },
    { value: "mentor", label: "Mentor" },

    // Transform / modal
    { value: "transform", label: "Transform" },
    { value: "daybound", label: "Daybound / Nightbound" },
    { value: "modal-dfc", label: "Modal DFC" },
];

// ============================================================================
// Filter Utility Functions
// ============================================================================

/**
 * Gets rarity filter options for a specific game
 * @param gameId - The game identifier (mtg, ptcg, ytcg)
 * @returns Array of filter options for the specified game, or default "All" option if game not found
 */
export function getRarityOptions(gameId: string | null): FilterOption[] {
    if (!gameId) return [{ value: "all", label: "All" }];
    return RARITY_OPTIONS[gameId] ?? [{ value: "all", label: "All" }];
}

/**
 * Gets type filter options for a specific game
 * @param gameId - The game identifier (mtg, ptcg, ytcg)
 * @returns Array of filter options for the specified game, or default "All" option if game not found
 */
export function getTypeOptions(gameId: string | null): FilterOption[] {
    if (!gameId) return [{ value: "all", label: "All" }];
    return TYPE_OPTIONS[gameId] ?? [{ value: "all", label: "All" }];
}

