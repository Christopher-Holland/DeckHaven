/**
 * Scryfall Search API Route
 * 
 * Searches for cards in Scryfall by name or other criteria.
 * 
 * GET /api/scryfall/search?q=query
 * 
 * @route /api/scryfall/search
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Query parameter 'q' is required" },
                { status: 400 }
            );
        }

        // Search Scryfall - use name search by default
        const trimmedQuery = query.trim();
        
        // Scryfall search syntax: wrap in quotes for exact name match, or use without quotes for partial
        // For better results, we'll search by name first
        const searchQuery = trimmedQuery.includes(' ') ? `!"${trimmedQuery}"` : trimmedQuery;
        const scryfallUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}&order=released&unique=prints`;
        
        const response = await fetch(scryfallUrl, {
            headers: {
                "Accept": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 404) {
                // No results found - Scryfall returns 404 when no matches
                return NextResponse.json({
                    object: "list",
                    data: [],
                    has_more: false,
                });
            }
            const text = await response.text();
            throw new Error(`Scryfall API error: ${text}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to search cards";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

