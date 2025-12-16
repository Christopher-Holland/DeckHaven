export type TCGNewsItem = {
    id: string;
    title: string;
    source: string;
    category: "Pokemon" | "MTG" | "YuGiOh" | "General";
    url: string;
    publishedAt: string;
};

export const tcgNews: TCGNewsItem[] = [
    {
        id: "1",
        title: "New Pokémon TCG Expansion Announced for Spring 2026",
        source: "PokéBeach",
        category: "Pokemon",
        url: "https://www.pokebeach.com",
        publishedAt: "2025-12-12",
    },
    {
        id: "2",
        title: "Magic: The Gathering Reveals Upcoming Standard Rotation Changes",
        source: "Wizards of the Coast",
        category: "MTG",
        url: "https://magic.wizards.com",
        publishedAt: "2025-12-11",
    },
    {
        id: "3",
        title: "Yu-Gi-Oh! Forbidden & Limited List Update Incoming",
        source: "Konami",
        category: "YuGiOh",
        url: "https://www.yugioh-card.com",
        publishedAt: "2025-12-10",
    },
    {
        id: "4",
        title: "Top 10 TCG Trends to Watch This Year",
        source: "TCGPlayer",
        category: "General",
        url: "https://infinite.tcgplayer.com",
        publishedAt: "2025-12-09",
    },
];