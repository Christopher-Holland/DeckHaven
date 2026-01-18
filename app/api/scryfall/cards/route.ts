/**
 * Scryfall Cards API Route
 * 
 * Fetches cards from a specific Magic: The Gathering set.
 * Supports pagination to handle large sets.
 * 
 * @route GET /api/scryfall/cards?setCode=xxx&page=1
 * @param setCode - Required: The set code (e.g., "m21", "thb")
 * @param page - Optional: Page number for pagination (default: 1)
 * @returns JSON response containing paginated cards from the specified set
 */

import { NextRequest, NextResponse } from "next/server";
import { getCardsBySetCode } from "@/app/lib/scryfall";

/**
 * GET handler for fetching cards by set code
 * 
 * @param request - Next.js request object containing query parameters
 * @returns NextResponse with cards data or error message
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const setCode = searchParams.get("setCode");
        const page = parseInt(searchParams.get("page") || "1", 10);

        if (!setCode) {
            return NextResponse.json(
                { error: "setCode query parameter is required" },
                { status: 400 }
            );
        }

        const result = await getCardsBySetCode(setCode, page);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch cards" },
            { status: 500 }
        );
    }
}
