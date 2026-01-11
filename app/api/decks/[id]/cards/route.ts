/**
 * Deck Cards API Route
 * 
 * Handles adding cards to a deck.
 * 
 * POST: Add a card to a deck
 * 
 * @route /api/decks/[id]/cards
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

export async function POST(
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
        const { cardId, quantity } = body;

        if (!cardId || typeof cardId !== "string") {
            return NextResponse.json(
                { error: "Invalid request. cardId is required and must be a string." },
                { status: 400 }
            );
        }

        const cardQuantity = quantity || 1;
        if (typeof cardQuantity !== "number" || cardQuantity < 1) {
            return NextResponse.json(
                { error: "Invalid request. quantity must be a positive number." },
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
        const deck = await prisma.deck.findFirst({
            where: {
                id: deckId,
                userId: dbUser.id,
            },
        });

        if (!deck) {
            return NextResponse.json(
                { error: "Deck not found" },
                { status: 404 }
            );
        }

        // Check if card already exists in deck
        const existingCard = await prisma.deckCard.findUnique({
            where: {
                deckId_cardId: {
                    deckId: deckId,
                    cardId: cardId,
                },
            },
        });

        if (existingCard) {
            // Update quantity
            const deckCard = await prisma.deckCard.update({
                where: {
                    id: existingCard.id,
                },
                data: {
                    quantity: existingCard.quantity + cardQuantity,
                },
            });

            return NextResponse.json({ deckCard });
        } else {
            // Create new deck card
            const deckCard = await prisma.deckCard.create({
                data: {
                    deckId: deckId,
                    cardId: cardId,
                    quantity: cardQuantity,
                },
            });

            return NextResponse.json({ deckCard });
        }
    } catch (error) {
        console.error("Error adding card to deck:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to add card to deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

