/**
 * Scryfall Card by ID API Route
 * 
 * Fetches a specific card from Scryfall by its ID.
 * Used to get card details for cards in the user's collection.
 * 
 * @route /api/scryfall/card/[cardId]
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const { cardId } = await params;
        
        const response = await fetch(`https://api.scryfall.com/cards/${cardId}`, {
            headers: {
                "Accept": "application/json",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Card not found" },
                { status: 404 }
            );
        }

        const card = await response.json();
        return NextResponse.json(card);
    } catch (error) {
        console.error("Error fetching card:", error);
        return NextResponse.json(
            { error: "Failed to fetch card" },
            { status: 500 }
        );
    }
}

