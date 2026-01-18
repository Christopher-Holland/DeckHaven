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
        const body = await request.json();
        const { cardId, slotNumber } = body;

        if (!cardId || typeof cardId !== "string") {
            return NextResponse.json(
                { error: "Invalid request. cardId is required and must be a string." },
                { status: 400 }
            );
        }

        if (slotNumber !== undefined && slotNumber !== null && (typeof slotNumber !== "number" || slotNumber < 0)) {
            return NextResponse.json(
                { error: "Invalid request. slotNumber must be a non-negative number or null." },
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

        // Check if binder exists and belongs to user
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

        // Determine grid size and limits
        const size = binder.size || "3x3";
        const cardsPerPage = size === "2x2" ? 4 : size === "4x4" ? 16 : 9;
        const maxPages = 20;
        const maxCards = size === "2x2" ? 160 : size === "4x4" ? 480 : 360; // 3x3 default
        
        // Check total card count
        const totalCards = await prisma.binderCard.count({
            where: { binderId: binderId },
        });
        
        if (totalCards >= maxCards) {
            return NextResponse.json(
                { error: `Binder is full. Maximum cards allowed: ${maxCards} (${maxPages} pages × ${cardsPerPage} cards per page).` },
                { status: 400 }
            );
        }
        
        // Calculate target slot number
        let targetSlotNumber: number | null = slotNumber ?? null;

        // If no preferred slot, find first empty slot
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
            
            // Find first available slot (0 to maxCards-1)
            for (let i = 0; i < maxCards; i++) {
                if (!usedSlots.has(i)) {
                    targetSlotNumber = i;
                    break;
                }
            }

            // If all slots are filled (shouldn't happen due to maxCards check above)
            if (targetSlotNumber === null) {
                return NextResponse.json(
                    { error: "Binder is full. No available slots." },
                    { status: 400 }
                );
            }
        }
        
        // Validate slot number is within bounds
        if (targetSlotNumber < 0 || targetSlotNumber >= maxCards) {
            return NextResponse.json(
                { error: `Invalid slot number. Must be between 0 and ${maxCards - 1}.` },
                { status: 400 }
            );
        }

        // Check if target slot is already occupied
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

        // Create new binder card (allow multiple copies of the same card)
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

