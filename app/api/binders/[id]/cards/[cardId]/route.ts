/**
 * Binder Card API Route (Individual Card)
 *
 * Handles operations for a specific card in a binder.
 *
 * PATCH: Move/swap a card to a new slot
 * DELETE: Remove a card from the binder
 *
 * @route /api/binders/[id]/cards/[cardId]
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";
import { moveBinderCardSchema } from "@/app/lib/schemas/binder";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

/** Moving a card to an occupied slot triggers a swap. Atomic via Prisma transaction to prevent race conditions. */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; cardId: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: binderId, cardId } = await params;

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = moveBinderCardSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { newSlotNumber } = parseResult.data;

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

        const size = binder.size || "3x3";
        const maxCards = size === "2x2" ? 160 : size === "4x4" ? 480 : 360;

        if (newSlotNumber >= maxCards) {
            return NextResponse.json(
                { error: `Invalid slot number. Maximum slot: ${maxCards - 1}.` },
                { status: 400 }
            );
        }

        const cardToMove = await prisma.binderCard.findFirst({
            where: {
                id: cardId,
                binderId: binderId,
            },
        });

        if (!cardToMove) {
            return NextResponse.json(
                { error: "Card not found in binder" },
                { status: 404 }
            );
        }

        const cardInTargetSlot = await prisma.binderCard.findFirst({
            where: {
                binderId: binderId,
                slotNumber: newSlotNumber,
                id: { not: cardId }, // Exclude the card being moved
            },
        });

        const oldSlotNumber = cardToMove.slotNumber;

        if (cardInTargetSlot) {
            await prisma.$transaction([
                prisma.binderCard.update({
                    where: { id: cardId },
                    data: { slotNumber: newSlotNumber },
                }),
                prisma.binderCard.update({
                    where: { id: cardInTargetSlot.id },
                    data: { slotNumber: oldSlotNumber },
                }),
            ]);

            return NextResponse.json({
                message: "Cards swapped successfully",
                movedCard: { id: cardId, slotNumber: newSlotNumber },
                swappedCard: { id: cardInTargetSlot.id, slotNumber: oldSlotNumber },
            });
        } else {
            const updatedCard = await prisma.binderCard.update({
                where: { id: cardId },
                data: { slotNumber: newSlotNumber },
            });

            return NextResponse.json({
                message: "Card moved successfully",
                card: updatedCard,
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to move card";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; cardId: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: binderId, cardId } = await params;

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

        const card = await prisma.binderCard.findFirst({
            where: {
                id: cardId,
                binderId: binderId,
            },
        });

        if (!card) {
            return NextResponse.json(
                { error: "Card not found in binder" },
                { status: 404 }
            );
        }

        await prisma.binderCard.delete({
            where: { id: cardId },
        });

        return NextResponse.json({
            message: "Card removed from binder successfully",
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete card";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

