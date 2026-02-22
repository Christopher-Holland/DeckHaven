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
import { addCardToDeckSchema } from "@/app/lib/schemas/deck";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

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

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                    details: [{ message: "Request body must be valid JSON" }],
                },
                { status: 400 }
            );
        }

        const parseResult = addCardToDeckSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { cardId, quantity: cardQuantity } = parseResult.data;

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

        const existingCard = await prisma.deckCard.findUnique({
            where: {
                deckId_cardId: {
                    deckId: deckId,
                    cardId: cardId,
                },
            },
        });

        const formatKey = deck.format as FormatKey;
        const formatRules = formatKey && FORMAT_RULES[formatKey] ? FORMAT_RULES[formatKey] : null;
        const isSingleton = formatRules?.singleton === true;
        const isLimited = formatRules?.category === "Limited";

        const basicLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
        let isBasicLand = false;

        // Scryfall API call for card validation. Failures handled gracefully to avoid blocking deck operations.
        try {
            const actualCardId = cardId.startsWith("c:") ? cardId.replace(/^c:/, "") : cardId;
            const scryfallResponse = await fetch(`https://api.scryfall.com/cards/${actualCardId}`);
            if (scryfallResponse.ok) {
                const cardData = await scryfallResponse.json();
                const cardName = cardData.name || "";
                isBasicLand = basicLands.includes(cardName);
            }
        } catch {
            // Scryfall failures default isBasicLand=false; copy limits apply.
        }

        // Format rules: Limited=unlimited, Singleton=1, Constructed=4. Basic lands always unlimited.
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

        if (existingCard) {
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
        const errorMessage = error instanceof Error ? error.message : "Failed to add card to deck";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

