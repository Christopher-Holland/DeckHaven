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
import { FORMAT_RULES, type FormatKey } from "@/app/lib/mtgFormatRules";

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

        // Get format rules for this deck
        const formatKey = deck.format as FormatKey;
        const formatRules = formatKey && FORMAT_RULES[formatKey] ? FORMAT_RULES[formatKey] : null;
        const isSingleton = formatRules?.singleton === true;
        const isLimited = formatRules?.category === "Limited";

        // Basic lands are always unlimited
        const basicLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
        let isBasicLand = false;

        // Check if it's a basic land by fetching from Scryfall
        try {
            // Strip "c:" prefix if present (for commander cards)
            const actualCardId = cardId.startsWith("c:") ? cardId.replace(/^c:/, "") : cardId;
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
        // Limited formats (Draft, Sealed) have no copy limit
        // Singleton formats (Commander, Brawl) have 1 copy limit
        // All other formats have 4 copy limit
        // Basic lands are always unlimited
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

        if (existingCard) {
            // Check copy limits if they apply
            if (copyLimit !== null) {
                const newQuantity = existingCard.quantity + cardQuantity;
                if (newQuantity > copyLimit) {
                    const formatName = formatRules?.name || deck.format || "this format";
                    if (isSingleton) {
                        return NextResponse.json(
                            { error: `${formatName} only allows 1 copy of each card (except basic lands)` },
                            { status: 400 }
                        );
                    } else {
                        return NextResponse.json(
                            { error: `${formatName} only allows 4 copies of each card (except basic lands). You already have ${existingCard.quantity} copy(ies).` },
                            { status: 400 }
                        );
                    }
                }
            }

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
            // For new cards, check if quantity exceeds limit
            if (copyLimit !== null && cardQuantity > copyLimit) {
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

