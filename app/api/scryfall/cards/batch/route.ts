/**
 * Scryfall Batch Card API Route
 *
 * Fetches multiple cards from Scryfall by ID in a single request.
 * Uses Scryfall's /cards/collection endpoint (max 75 per request, auto-chunked).
 * Fixes N+1 pattern when loading binder cards or deck details.
 *
 * @route POST /api/scryfall/cards/batch
 * @body { ids: string[] } - Array of Scryfall card IDs (UUIDs)
 * @returns { cards: Record<string, ScryfallCard> } - Map of cardId -> card
 */

import { NextRequest, NextResponse } from "next/server";
import { getCardsByIds } from "@/app/lib/scryfall";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const ids = body.ids;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "ids array is required and must not be empty" },
                { status: 400 }
            );
        }

        const validIds = ids.filter((id: unknown) => typeof id === "string" && id.trim().length > 0);
        if (validIds.length === 0) {
            return NextResponse.json({ cards: {} });
        }

        const cardMap = await getCardsByIds(validIds);
        const cards: Record<string, unknown> = {};
        cardMap.forEach((card, id) => {
            cards[id] = card;
        });

        return NextResponse.json({ cards }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch cards" },
            { status: 500 }
        );
    }
}
