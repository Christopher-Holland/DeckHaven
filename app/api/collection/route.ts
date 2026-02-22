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
import { addToCollectionSchema } from "@/app/lib/schemas/collection";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

/** Pagination defaults to 10 items per page. Total count and quantity calculated separately for efficiency. */
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

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const game = searchParams.get("game") || "all";
        const skip = (page - 1) * limit;

        // Currently all cards come from Scryfall (MTG only). Game filter applied client-side.
        const whereClause: { userId: string } = { userId: dbUser.id };

        const totalCount = await prisma.collection.count({
            where: whereClause,
        });

        const totalQuantityResult = await prisma.collection.aggregate({
            where: whereClause,
            _sum: {
                quantity: true,
            },
        });
        const totalQuantity = totalQuantityResult._sum.quantity || 0;

        const collections = await prisma.collection.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { updatedAt: "desc" },
        });

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
                total: totalCount, // Unique cards count
                totalQuantity: totalQuantity, // Total cards owned (sum of quantities)
                totalPages: Math.ceil(totalCount / limit),
            },
            gameFilter: game, // Return the game filter for client-side filtering
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}

/** All inputs validated via Zod. quantity=0 deletes. Upsert ensures atomic create/update. */
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

        const parseResult = addToCollectionSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { cardId, quantity, condition, language, notes, isFoil, tags } = parseResult.data;

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

        if (quantity === 0) {
            await prisma.collection.deleteMany({
                where: {
                    userId: dbUser.id,
                    cardId,
                },
            });
        } else {
            // Frontend always sends all fields; include them for consistent updates.
            const cleanUpdateData: {
                quantity: number;
                condition?: string | null;
                language?: string | null;
                notes?: string | null;
                tags?: string | null;
                isFoil?: boolean;
            } = {
                quantity,
            };

            cleanUpdateData.condition = condition ?? null;
            cleanUpdateData.language = language ?? null;
            cleanUpdateData.notes = notes ?? null;
            cleanUpdateData.tags = tags ?? null;
            if (isFoil !== undefined) cleanUpdateData.isFoil = isFoil;

            const createData = {
                userId: dbUser.id,
                cardId,
                quantity,
                condition,
                language,
                notes,
                tags,
                isFoil: isFoil ?? false,
            };

            await prisma.collection.upsert({
                where: {
                    userId_cardId: {
                        userId: dbUser.id,
                        cardId,
                    },
                },
                update: cleanUpdateData,
                create: createData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update collection";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

