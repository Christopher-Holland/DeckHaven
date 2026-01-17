/**
 * Deck Card API Route (Individual Card)
 * 
 * Handles operations for a specific card in a deck.
 * 
 * PATCH: Update a card's quantity in a deck
 * DELETE: Remove a card from a deck
 * 
 * @route /api/decks/[id]/cards/[deckCardId]
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";
import { FORMAT_RULES, type FormatKey } from "@/app/lib/mtgFormatRules";

export async function PATCH(
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
        const body = await request.json();
        const { quantity } = body;

        if (typeof quantity !== "number" || quantity < 0) {
            return NextResponse.json(
                { error: "Invalid request. quantity is required and must be a non-negative number." },
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

        // If quantity is 0, delete the card
        if (quantity === 0) {
            await prisma.deckCard.delete({
                where: {
                    id: deckCardId,
                },
            });
            return NextResponse.json({ success: true, deckCard: null });
        }

        // Get format rules for this deck
        const formatKey = deck.format as FormatKey;
        const formatRules = formatKey && FORMAT_RULES[formatKey] ? FORMAT_RULES[formatKey] : null;
        const isSingleton = formatRules?.singleton === true;
        const isLimited = formatRules?.category === "Limited";

        // Check copy limits if they apply (basic lands are always unlimited)
        const basicLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
        let isBasicLand = false;

        // Check if it's a basic land by fetching from Scryfall
        try {
            // Strip "c:" prefix if present (for commander cards)
            const actualCardId = deckCard.cardId.startsWith("c:") ? deckCard.cardId.replace(/^c:/, "") : deckCard.cardId;
            const scryfallResponse = await fetch(`https://api.scryfall.com/cards/${actualCardId}`);
            if (scryfallResponse.ok) {
                const cardData = await scryfallResponse.json();
                const cardName = cardData.name || "";
                isBasicLand = basicLands.includes(cardName);
            }
        } catch (err) {
            console.warn("Failed to fetch card from Scryfall for basic land check:", err);
        }

        // Determine copy limit based on format
        let copyLimit: number | null = null;
        if (!isBasicLand) {
            if (isLimited) {
                copyLimit = null; // No limit for Limited formats
            } else if (isSingleton) {
                copyLimit = 1; // Singleton for Commander-style formats
            } else {
                copyLimit = 4; // Standard 4 copy limit for Constructed formats
            }
        }

        // Check if new quantity exceeds limit
        if (copyLimit !== null && quantity > copyLimit) {
            const formatName = formatRules?.name || deck.format || "this format";
            if (isSingleton) {
                return NextResponse.json(
                    { error: `${formatName} only allows 1 copy of each card (except basic lands)` },
                    { status: 400 }
                );
            } else {
                return NextResponse.json(
                    { error: `${formatName} only allows 4 copies of each card (except basic lands)` },
                    { status: 400 }
                );
            }
        }

        // Update the quantity
        const updatedDeckCard = await prisma.deckCard.update({
            where: {
                id: deckCardId,
            },
            data: {
                quantity: quantity,
            },
        });

        return NextResponse.json({ deckCard: updatedDeckCard });
    } catch (error) {
        console.error("Error updating deck card:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update deck card";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

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

