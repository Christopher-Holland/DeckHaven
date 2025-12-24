import { NextResponse } from "next/server";
import { getRandomCard } from "@/app/lib/scryfall";

/**
 * GET /api/scryfall/cards/random
 * Fetch a random card from Scryfall
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

