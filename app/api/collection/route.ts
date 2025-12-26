/**
 * Collection API Routes
 * 
 * Handles CRUD operations for user card collections.
 * 
 * GET: Retrieve all cards in user's collection
 * POST: Add or update a card in the collection
 * DELETE: Remove a card from the collection
 * 
 * @route /api/collection
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

// Get user's collection
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

        // Get pagination params
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await prisma.collection.count({
            where: { userId: dbUser.id },
        });

        // Get paginated collection items
        const collections = await prisma.collection.findMany({
            where: { userId: dbUser.id },
            skip,
            take: limit,
            orderBy: { updatedAt: "desc" },
        });

        // Also return simple map for backward compatibility
        const collectionMap = new Map<string, number>();
        collections.forEach((item) => {
            collectionMap.set(item.cardId, item.quantity);
        });

        return NextResponse.json({
            items: collections,
            collection: Object.fromEntries(collectionMap), // For backward compatibility
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching collection:", error);
        return NextResponse.json(
            { error: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}

// Add or update card in collection
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
        const { cardId, quantity } = body;

        if (!cardId || typeof quantity !== "number" || quantity < 0) {
            return NextResponse.json(
                { error: "Invalid request. cardId and quantity (>= 0) are required." },
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

        if (quantity === 0) {
            // Remove from collection
            await prisma.collection.deleteMany({
                where: {
                    userId: dbUser.id,
                    cardId,
                },
            });
        } else {
            // Upsert collection item
            await prisma.collection.upsert({
                where: {
                    userId_cardId: {
                        userId: dbUser.id,
                        cardId,
                    },
                },
                update: { quantity },
                create: {
                    userId: dbUser.id,
                    cardId,
                    quantity,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating collection:", error);
        return NextResponse.json(
            { error: "Failed to update collection" },
            { status: 500 }
        );
    }
}

