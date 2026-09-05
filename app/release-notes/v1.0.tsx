import type { ReleaseNote } from "./types";

/**
 * Release notes for DeckHaven v1.0
 * Add new version files alongside this one (e.g. v1.1.tsx) and register them in registry.ts.
 */
const release: ReleaseNote = {
    slug: "v1.0",
    version: "1.0",
    title: "DeckHaven v1.0",
    date: "September 5, 2026",
    summary:
        "The first major DeckHaven update — better binders, smoother mobile layouts, and more reliable card data.",
    sections: [
        {
            heading: "New",
            items: [
                "Vault X–inspired binder covers and open-binder pages with cover, spine, and page color customization",
                "Dashboard announcement banner with a dedicated Release Notes section",
                "Remove cards from binders even when they are not in your collection",
            ],
        },
        {
            heading: "Improvements",
            items: [
                "Responsive layouts across dashboard, collection, binders, decks, sets, and drawers for phone, tablet, and desktop",
                "Collection inventory uses a mobile-friendly card list on small screens",
                "Binder browsing and page navigation redesigned for smaller screens",
            ],
        },
        {
            heading: "Fixes",
            items: [
                "Scryfall API requests now send a proper User-Agent so search and card loading work again",
                "Toasts no longer overflow narrow screens or sit under the mobile tab bar",
            ],
        },
    ],
};

export default release;
