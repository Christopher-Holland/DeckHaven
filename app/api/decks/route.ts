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
import { createDeckSchema } from "@/app/lib/schemas/deck";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

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

        // Get all decks for the user with total card count (sum of quantities)
        const decks = await prisma.deck.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: "desc" },
            include: {
                deckCards: { select: { quantity: true } },
            },
        });

        // Map to include totalCards (sum of quantities) for each deck
        const decksWithTotals = decks.map((deck) => {
            const totalCards = deck.deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
            const { deckCards, ...deckWithoutCards } = deck;
            return { ...deckWithoutCards, totalCards };
        });

        return NextResponse.json({ decks: decksWithTotals });
    } catch (error) {
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

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = createDeckSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { name, description, format, game, deckBoxColor, trimColor } = parseResult.data;

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
                name,
                description,
                format,
                game,
                deckBoxColor,
                trimColor,
            },
            include: {
                deckCards: { select: { quantity: true } },
            },
        });

        const totalCards = deck.deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
        const { deckCards, ...deckWithoutCards } = deck;
        return NextResponse.json({ deck: { ...deckWithoutCards, totalCards } });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

