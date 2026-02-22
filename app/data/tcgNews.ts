export type TCGNewsItem = {
    id: string;
    title: string;
    source: string;
    category: "Pokemon" | "MTG" | "YuGiOh" | "Coming Soon";
    url: string;
    publishedAt: string;
};

export const tcgNews: TCGNewsItem[] = [
    {
        id: "1",
        title: "THIS FEATURE IS COMING SOON",
        source: "DeckHaven",
        category: "Coming Soon",
        url: "https://www.deckhaven.com",
        publishedAt: "TBD",
    },
];