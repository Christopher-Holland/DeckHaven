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
import { updateDeckSchema } from "@/app/lib/schemas/deck";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

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

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = updateDeckSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { name, description, format, deckBoxColor, trimColor } = parseResult.data;

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
                name,
                description,
                format,
                deckBoxColor,
                trimColor,
            },
            include: {
                _count: {
                    select: { deckCards: true },
                },
            },
        });

        return NextResponse.json({ deck });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

