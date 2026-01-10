/**
 * Decks API Routes
 * 
 * Handles CRUD operations for user decks.
 * 
 * GET: Retrieve all user's decks
 * POST: Create a new deck
 * 
 * @route /api/decks
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

// Get user's decks
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get or create user in database
        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

        // Get all decks for the user with their card counts
        const decks = await prisma.deck.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { deckCards: true },
                },
            },
        });

        return NextResponse.json({ decks });
    } catch (error) {
        console.error("Error fetching decks:", error);
        return NextResponse.json(
            { error: "Failed to fetch decks" },
            { status: 500 }
        );
    }
}

// Create a new deck
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description, format, game, deckBoxColor, trimColor } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid request. name is required and must be a non-empty string." },
                { status: 400 }
            );
        }

        if (!game || typeof game !== "string" || !["mtg", "pokemon", "yugioh"].includes(game)) {
            return NextResponse.json(
                { error: "Invalid request. game is required and must be one of: mtg, pokemon, yugioh." },
                { status: 400 }
            );
        }

        // Validate optional fields
        if (description !== undefined && typeof description !== "string" && description !== null) {
            return NextResponse.json(
                { error: "Invalid request. description must be a string or null." },
                { status: 400 }
            );
        }
        if (format !== undefined && typeof format !== "string" && format !== null) {
            return NextResponse.json(
                { error: "Invalid request. format must be a string or null." },
                { status: 400 }
            );
        }
        if (deckBoxColor !== undefined && typeof deckBoxColor !== "string" && deckBoxColor !== null) {
            return NextResponse.json(
                { error: "Invalid request. deckBoxColor must be a string or null." },
                { status: 400 }
            );
        }
        if (trimColor !== undefined && typeof trimColor !== "string" && trimColor !== null) {
            return NextResponse.json(
                { error: "Invalid request. trimColor must be a string or null." },
                { status: 400 }
            );
        }

        // Get or create user in database
        let dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            // Create user if doesn't exist
            dbUser = await prisma.user.create({
                data: {
                    stackUserId: user.id,
                    email: user.primaryEmail,
                    name: user.displayName || user.primaryEmail?.split("@")[0] || null,
                    image: user.profileImageUrl || null,
                },
            });
        }

        // Create deck
        const deck = await prisma.deck.create({
            data: {
                userId: dbUser.id,
                name: name.trim(),
                description: description?.trim() || null,
                format: format || null,
                game: game,
                deckBoxColor: deckBoxColor || null,
                trimColor: trimColor || null,
            },
            include: {
                _count: {
                    select: { deckCards: true },
                },
            },
        });

        return NextResponse.json({ deck });
    } catch (error) {
        console.error("Error creating deck:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

