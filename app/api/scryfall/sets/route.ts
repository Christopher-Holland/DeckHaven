import { NextResponse } from "next/server";
import { getSets } from "@/app/lib/scryfall";

/**
 * GET /api/scryfall/sets
 * Fetch all sets from Scryfall
 */
export async function GET() {
  try {
    const result = await getSets();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sets from Scryfall:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sets" },
      { status: 500 }
    );
  }
}

