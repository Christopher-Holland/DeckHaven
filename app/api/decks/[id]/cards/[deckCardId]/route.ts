/**
 * Deck Card API Route (Individual Card)
 * 
 * Handles operations for a specific card in a deck.
 * 
 * DELETE: Remove a card from a deck
 * 
 * @route /api/decks/[id]/cards/[deckCardId]
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; deckCardId: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: deckId, deckCardId } = await params;

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

        // Check if deck card exists and belongs to the deck
        const deckCard = await prisma.deckCard.findFirst({
            where: {
                id: deckCardId,
                deckId: deckId,
            },
        });

        if (!deckCard) {
            return NextResponse.json(
                { error: "Card not found in deck" },
                { status: 404 }
            );
        }

        // Delete the deck card
        await prisma.deckCard.delete({
            where: {
                id: deckCardId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing card from deck:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to remove card from deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

