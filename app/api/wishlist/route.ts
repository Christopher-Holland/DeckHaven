/**
 * Wishlist API Routes
 * 
 * Handles operations for user wishlists.
 * 
 * GET: Retrieve all cards in user's wishlist
 * POST: Add a card to the wishlist
 * DELETE: Remove a card from the wishlist
 * 
 * @route /api/wishlist
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

// Get user's wishlist
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get or create user in database
        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: dbUser.id },
            select: { cardId: true },
        });

        const wishlistSet = new Set(wishlist.map((item) => item.cardId));

        return NextResponse.json({ wishlist: Array.from(wishlistSet) });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch wishlist" },
            { status: 500 }
        );
    }
}

// Add or remove card from wishlist
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { cardId, isWishlisted } = body;

        if (!cardId || typeof isWishlisted !== "boolean") {
            return NextResponse.json(
                { error: "Invalid request. cardId and isWishlisted (boolean) are required." },
                { status: 400 }
            );
        }

        // Get or create user in database
        let dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            // Create user if doesn't exist
            dbUser = await prisma.user.create({
                data: {
                    stackUserId: user.id,
                    email: user.primaryEmail,
                    name: user.displayName || user.primaryEmail?.split("@")[0] || null,
                    image: user.profileImageUrl || null,
                },
            });
        }

        if (isWishlisted) {
            // Add to wishlist
            await prisma.wishlist.upsert({
                where: {
                    userId_cardId: {
                        userId: dbUser.id,
                        cardId,
                    },
                },
                update: {},
                create: {
                    userId: dbUser.id,
                    cardId,
                },
            });
        } else {
            // Remove from wishlist
            await prisma.wishlist.deleteMany({
                where: {
                    userId: dbUser.id,
                    cardId,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update wishlist" },
            { status: 500 }
        );
    }
}

