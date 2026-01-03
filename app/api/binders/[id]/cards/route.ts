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
        const { cardId, page, preferredSlotIndex } = body;

        if (!cardId || typeof cardId !== "string") {
            return NextResponse.json(
                { error: "Invalid request. cardId is required and must be a string." },
                { status: 400 }
            );
        }

        if (page !== undefined && (typeof page !== "number" || page < 1)) {
            return NextResponse.json(
                { error: "Invalid request. page must be a positive number." },
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

        // Calculate target page and slot
        const targetPage = page || 1;
        
        // Validate page limit
        if (targetPage > maxPages) {
            return NextResponse.json(
                { error: `Cannot add card to page ${targetPage}. Maximum pages allowed: ${maxPages}.` },
                { status: 400 }
            );
        }
        
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
        
        let targetSlotIndex: number | null = preferredSlotIndex ?? null;

        // If no preferred slot, find first empty slot on the target page
        if (targetSlotIndex === null) {
            const existingCards = await prisma.binderCard.findMany({
                where: {
                    binderId: binderId,
                    pageNumber: targetPage,
                },
            });

            const usedSlots = new Set(existingCards.map(c => c.slotIndex).filter(idx => idx !== null));
            
            // Find first available slot
            for (let i = 0; i < cardsPerPage; i++) {
                if (!usedSlots.has(i)) {
                    targetSlotIndex = i;
                    break;
                }
            }

            // If all slots are filled, add to the end
            if (targetSlotIndex === null) {
                targetSlotIndex = existingCards.length;
            }
        }

        // Check if card already exists in binder
        const existingBinderCard = await prisma.binderCard.findFirst({
            where: {
                binderId: binderId,
                cardId: cardId,
            },
        });

        if (existingBinderCard) {
            // Update existing card's position if slot is specified
            if (targetSlotIndex !== null && targetPage) {
                await prisma.binderCard.update({
                    where: { id: existingBinderCard.id },
                    data: {
                        slotIndex: targetSlotIndex,
                        pageNumber: targetPage,
                    },
                });
            }
            return NextResponse.json({ 
                binderCard: existingBinderCard,
                message: "Card already in binder, position updated" 
            });
        }

        // Create new binder card
        const binderCard = await prisma.binderCard.create({
            data: {
                binderId: binderId,
                cardId: cardId,
                slotIndex: targetSlotIndex,
                pageNumber: targetPage,
            },
        });

        return NextResponse.json({ binderCard });
    } catch (error) {
        console.error("Error adding card to binder:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to add card to binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

