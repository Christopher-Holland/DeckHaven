/**
 * Set Card Filter Options
 * 
 * Provides filter options for filtering cards on the set detail page.
 * Organized for easy modification and extension.
 * 
 * @module sets/[setId]/setCardFilters
 */

export type CardTypeFilter = "all" | "creature" | "instant" | "sorcery" | "artifact" | "enchantment" | "planeswalker" | "land" | "battle";

export type ColorFilter = "all" | "white" | "blue" | "black" | "red" | "green" | "colorless" | "multicolor";

export type RarityFilter = "all" | "common" | "uncommon" | "rare" | "mythic" | "special";

export type ManaValueFilter = "all" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7+";

export type FilterOption = {
    value: string;
    label: string;
};

/**
 * Card Type filter options
 */
export const CARD_TYPE_OPTIONS: FilterOption[] = [
    { value: "all", label: "All Types" },
    { value: "creature", label: "Creature" },
    { value: "instant", label: "Instant" },
    { value: "sorcery", label: "Sorcery" },
    { value: "artifact", label: "Artifact" },
    { value: "enchantment", label: "Enchantment" },
    { value: "planeswalker", label: "Planeswalker" },
    { value: "land", label: "Land" },
    { value: "battle", label: "Battle" },
];

/**
 * Color filter options
 */
export const COLOR_OPTIONS: FilterOption[] = [
    { value: "all", label: "All Colors" },
    { value: "white", label: "White" },
    { value: "blue", label: "Blue" },
    { value: "black", label: "Black" },
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "colorless", label: "Colorless" },
    { value: "multicolor", label: "Multicolor" },
];

/**
 * Rarity filter options
 */
export const RARITY_OPTIONS: FilterOption[] = [
    { value: "all", label: "All Rarities" },
    { value: "common", label: "Common" },
    { value: "uncommon", label: "Uncommon" },
    { value: "rare", label: "Rare" },
    { value: "mythic", label: "Mythic Rare" },
    { value: "special", label: "Special" },
];

/**
 * Mana Value (CMC) filter options
 */
export const MANA_VALUE_OPTIONS: FilterOption[] = [
    { value: "all", label: "All Mana Values" },
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7+", label: "7+" },
];

export type SetCardFilters = {
    cardType: CardTypeFilter;
    color: ColorFilter;
    rarity: RarityFilter;
    manaValue: ManaValueFilter;
};

