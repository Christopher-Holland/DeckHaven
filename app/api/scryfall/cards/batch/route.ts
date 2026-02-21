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
import { batchCardsSchema } from "@/app/lib/schemas/scryfall";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

export async function POST(request: NextRequest) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = batchCardsSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { ids } = parseResult.data;
        const validIds = ids.filter((id) => id.trim().length > 0);
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
