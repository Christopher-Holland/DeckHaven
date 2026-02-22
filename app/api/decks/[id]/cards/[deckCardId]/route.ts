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
import { updateDeckCardQuantitySchema } from "@/app/lib/schemas/deck";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

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

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = updateDeckCardQuantitySchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { quantity } = parseResult.data;

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

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

        if (quantity === 0) {
            await prisma.deckCard.delete({
                where: {
                    id: deckCardId,
                },
            });
            return NextResponse.json({ success: true, deckCard: null });
        }

        const formatKey = deck.format as FormatKey;
        const formatRules = formatKey && FORMAT_RULES[formatKey] ? FORMAT_RULES[formatKey] : null;
        const isSingleton = formatRules?.singleton === true;
        const isLimited = formatRules?.category === "Limited";

        const basicLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
        let isBasicLand = false;

        // Scryfall API call for card validation. Failures handled gracefully to avoid blocking deck operations.
        try {
            const actualCardId = deckCard.cardId.startsWith("c:") ? deckCard.cardId.replace(/^c:/, "") : deckCard.cardId;
            const scryfallResponse = await fetch(`https://api.scryfall.com/cards/${actualCardId}`);
            if (scryfallResponse.ok) {
                const cardData = await scryfallResponse.json();
                const cardName = cardData.name || "";
                isBasicLand = basicLands.includes(cardName);
            }
        } catch {
            // Scryfall failures default isBasicLand=false; copy limits apply.
        }

        let copyLimit: number | null = null;
        if (!isBasicLand) {
            if (isLimited) {
                copyLimit = null;
            } else if (isSingleton) {
                copyLimit = 1;
            } else {
                copyLimit = 4;
            }
        }

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

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

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

        await prisma.deckCard.delete({
            where: {
                id: deckCardId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to remove card from deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

