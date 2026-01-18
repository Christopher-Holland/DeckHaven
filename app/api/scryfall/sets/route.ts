/**
 * Scryfall Sets API Route
 * 
 * Fetches all Magic: The Gathering sets from the Scryfall API.
 * This endpoint is used by the sets browse page to display available sets.
 * 
 * @route GET /api/scryfall/sets
 * @returns JSON response containing all sets from Scryfall
 */

import { NextResponse } from "next/server";
import { getSets } from "@/app/lib/scryfall";

/**
 * GET handler for fetching all sets
 * 
 * @returns NextResponse with sets data or error message
 */
export async function GET() {
    try {
        const result = await getSets();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch sets" },
            { status: 500 }
        );
    }
}
