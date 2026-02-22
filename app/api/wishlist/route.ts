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
import { wishlistToggleSchema } from "@/app/lib/schemas/wishlist";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

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

export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = wishlistToggleSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { cardId, isWishlisted } = parseResult.data;

        let dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
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

