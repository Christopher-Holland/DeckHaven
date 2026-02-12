/**
 * Scryfall API Client
 * 
 * Provides TypeScript types and utility functions for interacting with the Scryfall API.
 * Used for fetching Magic: The Gathering card and set data.
 * 
 * @module lib/scryfall
 */

export type ScryfallCard = {
    id: string;
    name: string;
    type_line: string;
    rarity: string;
    set: string; // Set code (e.g., "m21", "thb")
    set_name: string;
    collector_number: string;
    mana_cost?: string;
    cmc?: number; // Converted mana cost
    oracle_text?: string;
    colors?: string[];
    color_identity?: string[];
    image_uris?: { normal?: string; small?: string; large?: string; png?: string };
    card_faces?: Array<{
        name: string;
        type_line: string;
        mana_cost?: string;
        oracle_text?: string;
        colors?: string[];
        image_uris?: { normal?: string; small?: string; large?: string; png?: string };
    }>;
    prices?: {
        usd?: string | null;
        usd_foil?: string | null;
    };
};

export type ScryfallList<T> = {
    object: "list";
    data: T[];
    has_more: boolean;
    next_page?: string;
};

const SCRYFALL_BASE_URL = "https://api.scryfall.com";

/**
 * Generic fetch wrapper for Scryfall API requests
 * 
 * @param path - API endpoint path (e.g., "/cards/search")
 * @param init - Optional fetch configuration
 * @returns Promise resolving to the API response
 * @throws Error if the API request fails
 */
export async function scryfallFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${SCRYFALL_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Accept": "application/json",
            ...(init?.headers ?? {}),
        },
        // Cache for 60 seconds to reduce API calls
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Scryfall ${res.status} ${res.statusText}: ${text}`);
    }

    return res.json() as Promise<T>;
}

/**
 * Fetches all cards in a specific set, paginated
 * 
 * @param setCode - The set code (e.g., "m21", "thb")
 * @param page - Page number (default: 1)
 * @returns Promise resolving to a paginated list of cards
 */
export async function getCardsBySetCode(setCode: string, page = 1) {
    const q = encodeURIComponent(`set:${setCode} game:paper`);
    return scryfallFetch<ScryfallList<ScryfallCard>>(
        `/cards/search?q=${q}&order=set&unique=prints&page=${page}`
    );
}

/**
 * Fetches a random card from Scryfall
 * Useful for discovery features or "card of the day" functionality
 * 
 * @returns Promise resolving to a random card
 */
export async function getRandomCard() {
    return scryfallFetch<ScryfallCard>(`/cards/random`);
}

/**
 * Scryfall Set type definition
 * Represents a Magic: The Gathering set
 */
export type ScryfallSet = {
    id: string;
    code: string; // Set code (e.g., "m21")
    name: string;
    released_at?: string; // ISO date string
    set_type?: string; // e.g., "expansion", "core", "commander"
    icon_svg_uri?: string; // URL to set icon SVG
    card_count?: number; // Total number of cards in the set
    parent_set_code?: string; // Code of parent set if this is a child set
};

/**
 * Fetches all sets from Scryfall
 * 
 * @returns Promise resolving to a list of all sets
 */
export async function getSets() {
    return scryfallFetch<{ object: "list"; data: ScryfallSet[] }>(`/sets`);
}

const SCRYFALL_COLLECTION_CHUNK_SIZE = 75;

/**
 * Fetches multiple cards by Scryfall ID in a single batched request.
 * Uses Scryfall's /cards/collection endpoint (max 75 per request).
 * Chunks automatically for larger sets.
 *
 * @param ids - Array of Scryfall card IDs (UUIDs)
 * @returns Map of cardId -> ScryfallCard for successfully fetched cards
 */
export async function getCardsByIds(ids: string[]): Promise<Map<string, ScryfallCard>> {
    const result = new Map<string, ScryfallCard>();
    const uniqueIds = [...new Set(ids)].filter(Boolean);

    for (let i = 0; i < uniqueIds.length; i += SCRYFALL_COLLECTION_CHUNK_SIZE) {
        const chunk = uniqueIds.slice(i, i + SCRYFALL_COLLECTION_CHUNK_SIZE);
        const identifiers = chunk.map((id) => ({ id }));

        const list = await scryfallFetch<ScryfallList<ScryfallCard>>(`/cards/collection`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifiers }),
        });

        if (list.data) {
            for (const card of list.data) {
                result.set(card.id, card);
            }
        }
    }

    return result;
}
