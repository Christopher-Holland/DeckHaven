import { NextRequest, NextResponse } from "next/server";
import { getCardsBySetCode } from "@/app/lib/scryfall";

/**
 * GET /api/scryfall/cards?setCode=xxx&page=1
 * Fetch cards from Scryfall by set code
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
    console.error("Error fetching cards from Scryfall:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

