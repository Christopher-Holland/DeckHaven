/**
 * Unified Search API
 *
 * Searches across cards (Scryfall), sets, deck names, and binder names.
 * Returns results grouped by type for display in the navbar dropdown.
 *
 * GET /api/search?q=query
 *
 * @route /api/search
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";
import { getSets } from "@/app/lib/scryfall";
import type { ScryfallSet } from "@/app/lib/scryfall";

const MAX_CARDS = 5;
const MAX_SETS = 5;
const MAX_DECKS = 5;
const MAX_BINDERS = 5;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q")?.trim();

        if (!q || q.length < 2) {
            return NextResponse.json({
                cards: [],
                sets: [],
                decks: [],
                binders: [],
            });
        }

        const query = q.toLowerCase();

        // Parallel searches for optimal response time; each handler manages its own errors.
        const [cardsResult, setsResult, decksResult, bindersResult] = await Promise.all([
            searchCards(query),
            searchSets(query),
            searchDecks(query),
            searchBinders(query),
        ]);

        return NextResponse.json({
            cards: cardsResult,
            sets: setsResult,
            decks: decksResult,
            binders: bindersResult,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Search failed" },
            { status: 500 }
        );
    }
}

async function searchCards(query: string) {
    try {
        const searchQuery = query;
        const scryfallUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}&order=released&unique=prints&page=1`;
        const response = await fetch(scryfallUrl, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 404) return [];
            return [];
        }

        const data = await response.json();
        const cards = data.data || [];
        return cards.slice(0, MAX_CARDS);
    } catch {
        return [];
    }
}

async function searchSets(query: string) {
    try {
        const result = await getSets();
        const sets = (result.data || []) as ScryfallSet[];

        const filtered = sets.filter(
            (s) =>
                s.name?.toLowerCase().includes(query) ||
                s.code?.toLowerCase().includes(query)
        );

        return filtered.slice(0, MAX_SETS);
    } catch {
        return [];
    }
}

async function searchDecks(query: string) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) return [];

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });
        if (!dbUser) return [];

        const decks = await prisma.deck.findMany({
            where: {
                userId: dbUser.id,
                name: { contains: query, mode: "insensitive" },
            },
            orderBy: { updatedAt: "desc" },
            take: MAX_DECKS,
            include: {
                deckCards: { select: { quantity: true } },
            },
        });

        return decks.map((deck) => {
            const totalCards = deck.deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
            const { deckCards, ...deckWithoutCards } = deck;
            return { ...deckWithoutCards, totalCards };
        });
    } catch {
        return [];
    }
}

async function searchBinders(query: string) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) return [];

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });
        if (!dbUser) return [];

        const binders = await prisma.binder.findMany({
            where: {
                userId: dbUser.id,
                name: { contains: query, mode: "insensitive" },
            },
            orderBy: { updatedAt: "desc" },
            take: MAX_BINDERS,
            include: {
                _count: { select: { binderCards: true } },
            },
        });

        return binders;
    } catch {
        return [];
    }
}
