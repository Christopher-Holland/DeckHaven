"use client";

import { JSX } from "react";

type FAQItem = {
    q: string;
    a: string | JSX.Element;
};

const faqs: FAQItem[] = [
    {
        q: "What is DeckHaven?",
        a: (
            <>
                DeckHaven is a digital companion for tabletop card games. It helps you
                organize your collection, manage binders, build decks, and keep
                everything in one place—like laying your cards out on a table, but
                smarter.
            </>
        ),
    },
    {
        q: "Where should I start?",
        a: (
            <>
                Start with your <strong>collection</strong>. Add cards at your own
                pace—there’s no need to enter everything at once. Once you have cards in
                your collection, you can organize them into binders or build decks from
                what you own.
            </>
        ),
    },
    {
        q: "What’s the difference between a binder and a deck?",
        a: (
            <ul className="list-disc pl-5 space-y-2">
                <li>
                    <strong>Binders</strong> represent how you store cards physically
                    (boxes, binders, folders).
                </li>
                <li>
                    <strong>Decks</strong> represent playable card lists built from your
                    collection.
                </li>
                <li>
                    A card can exist in your collection and appear in multiple decks
                    without being duplicated.
                </li>
            </ul>
        ),
    },
    {
        q: "Do I need to enter my entire collection right away?",
        a: (
            <>
                No. DeckHaven is designed to grow with you. Add a few cards, a single
                binder, or one deck—whatever feels comfortable. You can always expand
                later.
            </>
        ),
    },
    {
        q: "Can I use DeckHaven for multiple games?",
        a: (
            <>
                Yes. DeckHaven supports organizing cards from different games (such as
                Magic, Pokémon, and others) so you can keep everything together without
                mixing things up. Please note that some games shown in the app are not yet supported.
            </>
        ),
    },
    {
        q: "Is my data private?",
        a: (
            <>
                Yes. Your collection, decks, and settings are tied to your account and
                are not shared publicly. DeckHaven does not sell or expose your data.
            </>
        ),
    },
    {
        q: "What are themes and accent colors?",
        a: (
            <>
                Themes control the overall look of DeckHaven, while accent colors
                highlight buttons, selections, and interactive elements. You can mix and
                match them to suit your style—nothing here affects your data.
            </>
        ),
    },
    {
        q: "Why are some settings marked “Coming Soon”?",
        a: (
            <>
                DeckHaven is actively evolving. Some features are planned but not yet
                available. These are shown so you know what’s coming, not because
                anything is broken.
            </>
        ),
    },
    {
        q: "Is DeckHaven finished?",
        a: (
            <>
                DeckHaven is considered a <strong>1.0 release</strong>, meaning it’s
                stable and usable, but more features and refinements are planned over
                time. Your setup today will carry forward as the app grows.
            </>
        ),
    },
];

export default function FAQPage() {
    return (
        <main className="min-h-screen px-6 py-8 bg-[var(--theme-bg)] text-[var(--theme-fg)]">
            <div className="mx-auto w-full max-w-3xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
                    <p className="mt-2 opacity-80">
                        Quick answers to help you get comfortable with DeckHaven.
                    </p>
                </header>

                <section className="space-y-3">
                    {faqs.map((item, idx) => (
                        <details
                            key={idx}
                            className="group rounded-xl border border-[var(--theme-border)]/35 bg-[var(--theme-card)]/70 backdrop-blur px-4 py-3"
                        >
                            <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-4">
                                <span className="text-base font-semibold">{item.q}</span>
                                <span className="shrink-0 text-sm opacity-70 group-open:rotate-180 transition-transform">
                                    ▼
                                </span>
                            </summary>

                            <div className="mt-3 text-sm leading-relaxed opacity-90">
                                {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
                            </div>
                        </details>
                    ))}
                </section>

                <footer className="mt-10 rounded-xl border border-[var(--theme-border)]/30 bg-[var(--theme-card)]/60 px-4 py-3">
                    <p className="text-sm opacity-80">
                        DeckHaven is built to feel familiar, not overwhelming. Take it one
                        step at a time.
                    </p>
                </footer>
            </div>
        </main>
    );
}