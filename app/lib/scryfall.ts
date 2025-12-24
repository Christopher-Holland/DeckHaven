export type ScryfallCard = {
    id: string;
    name: string;
    type_line: string;
    rarity: string;
    set: string; // set code
    set_name: string;
    collector_number: string;
    mana_cost?: string;
    cmc?: number;
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

const SCRYFALL = "https://api.scryfall.com";

export async function scryfallFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${SCRYFALL}${path}`, {
        ...init,
        headers: {
            "Accept": "application/json",
            ...(init?.headers ?? {}),
        },
        // Helps Next cache; tweak later
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Scryfall ${res.status} ${res.statusText}: ${text}`);
    }

    return res.json() as Promise<T>;
}

/**
 * Cards in a set (paginated). Good for SetCards page.
 */
export async function getCardsBySetCode(setCode: string, page = 1) {
    const q = encodeURIComponent(`set:${setCode} game:paper`);
    return scryfallFetch<ScryfallList<ScryfallCard>>(
        `/cards/search?q=${q}&order=set&unique=prints&page=${page}`
    );
}

/**
 * Trending-ish option: “most played” isn’t directly supported for paper,
 * so use a “random” endpoint or curated query for now.
 */
export async function getRandomCard() {
    return scryfallFetch<ScryfallCard>(`/cards/random`);
}

/**
 * Sets list (for your Sets page later)
 */
export type ScryfallSet = {
    id: string;
    code: string;
    name: string;
    released_at?: string;
    set_type?: string;
    icon_svg_uri?: string;
};

export async function getSets() {
    return scryfallFetch<{ object: "list"; data: ScryfallSet[] }>(`/sets`);
}