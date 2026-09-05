/**
 * Scryfall Card by ID API Route
 * 
 * Fetches a specific card from Scryfall by its ID.
 * Used to get card details for cards in the user's collection.
 * 
 * @route /api/scryfall/card/[cardId]
 */

import { NextRequest, NextResponse } from "next/server";
import { getCardById } from "@/app/lib/scryfall";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const { cardId } = await params;
        const card = await getCardById(cardId);
        return NextResponse.json(card);
    } catch {
        return NextResponse.json(
            { error: "Card not found" },
            { status: 404 }
        );
    }
}

