/**
 * Deck API Routes (Individual Deck)
 * 
 * Handles operations for a specific deck.
 * 
 * GET: Get a single deck with its cards
 * PATCH: Update a deck
 * DELETE: Delete a deck
 * 
 * @route /api/decks/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

// Get a single deck with its cards
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: deckId } = await params;

        // Get user in database
        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

        // Get deck with its cards
        const deck = await prisma.deck.findFirst({
            where: {
                id: deckId,
                userId: dbUser.id,
            },
            include: {
                _count: {
                    select: { deckCards: true },
                },
                deckCards: {
                    select: {
                        id: true,
                        cardId: true,
                        quantity: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        if (!deck) {
            return NextResponse.json(
                { error: "Deck not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ deck });
    } catch (error) {
        console.error("Error fetching deck:", error);
        return NextResponse.json(
            { error: "Failed to fetch deck" },
            { status: 500 }
        );
    }
}

// Update a deck
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: deckId } = await params;
        const body = await request.json();
        const { name, description, format, deckBoxColor, trimColor } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid request. name is required and must be a non-empty string." },
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

        // Get user in database
        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

        // Check if deck exists and belongs to user
        const existingDeck = await prisma.deck.findFirst({
            where: {
                id: deckId,
                userId: dbUser.id,
            },
        });

        if (!existingDeck) {
            return NextResponse.json(
                { error: "Deck not found" },
                { status: 404 }
            );
        }

        // Update deck
        const deck = await prisma.deck.update({
            where: { id: deckId },
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                format: format || null,
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
        console.error("Error updating deck:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

