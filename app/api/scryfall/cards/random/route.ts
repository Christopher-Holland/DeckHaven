/**
 * Scryfall Random Card API Route
 * 
 * Fetches a random Magic: The Gathering card from Scryfall.
 * Useful for discovery features, "card of the day", or random card showcases.
 * 
 * @route GET /api/scryfall/cards/random
 * @returns JSON response containing a random card
 */

import { NextResponse } from "next/server";
import { getRandomCard } from "@/app/lib/scryfall";

/**
 * GET handler for fetching a random card
 * 
 * @returns NextResponse with random card data or error message
 */
export async function GET() {
    try {
        const card = await getRandomCard();
        return NextResponse.json(card);
    } catch (error) {
        console.error("Error fetching random card from Scryfall:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch random card" },
            { status: 500 }
        );
    }
}
