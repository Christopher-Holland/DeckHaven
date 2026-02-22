/**
 * Binder Cards API Route
 *
 * Handles adding cards to a binder with slot tracking.
 *
 * POST: Add a card to a specific slot in a binder
 *
 * @route /api/binders/[id]/cards
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";
import { addCardToBinderSchema } from "@/app/lib/schemas/binder";
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

        const { id: binderId } = await params;

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = addCardToBinderSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { cardId, slotNumber } = parseResult.data;

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

        const binder = await prisma.binder.findFirst({
            where: {
                id: binderId,
                userId: dbUser.id,
            },
        });

        if (!binder) {
            return NextResponse.json(
                { error: "Binder not found" },
                { status: 404 }
            );
        }

        // Binder size limits prevent unbounded growth. Max cards: 2x2=160, 3x3=360, 4x4=480 (20 pages × cards per page).
        const size = binder.size || "3x3";
        const cardsPerPage = size === "2x2" ? 4 : size === "4x4" ? 16 : 9;
        const maxPages = 20;
        const maxCards = size === "2x2" ? 160 : size === "4x4" ? 480 : 360;

        const totalCards = await prisma.binderCard.count({
            where: { binderId: binderId },
        });
        
        if (totalCards >= maxCards) {
            return NextResponse.json(
                { error: `Binder is full. Maximum cards allowed: ${maxCards} (${maxPages} pages × ${cardsPerPage} cards per page).` },
                { status: 400 }
            );
        }

        let targetSlotNumber: number | null = slotNumber ?? null;

        if (targetSlotNumber === null) {
            const existingCards = await prisma.binderCard.findMany({
                where: {
                    binderId: binderId,
                },
                select: {
                    slotNumber: true,
                },
            });

            const usedSlots = new Set(existingCards.map(c => c.slotNumber).filter(slot => slot !== null));

            for (let i = 0; i < maxCards; i++) {
                if (!usedSlots.has(i)) {
                    targetSlotNumber = i;
                    break;
                }
            }

            if (targetSlotNumber === null) {
                return NextResponse.json(
                    { error: "Binder is full. No available slots." },
                    { status: 400 }
                );
            }
        }

        if (targetSlotNumber < 0 || targetSlotNumber >= maxCards) {
            return NextResponse.json(
                { error: `Invalid slot number. Must be between 0 and ${maxCards - 1}.` },
                { status: 400 }
            );
        }

        const existingCardInSlot = await prisma.binderCard.findFirst({
            where: {
                binderId: binderId,
                slotNumber: targetSlotNumber,
            },
        });

        if (existingCardInSlot) {
            return NextResponse.json(
                { error: "This slot is already occupied. Please choose a different slot." },
                { status: 400 }
            );
        }

        // Multiple copies of the same card are allowed in binders (unlike decks with format restrictions).
        const binderCard = await prisma.binderCard.create({
            data: {
                binderId: binderId,
                cardId: cardId,
                slotNumber: targetSlotNumber,
            },
        });

        return NextResponse.json({ binderCard });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to add card to binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

