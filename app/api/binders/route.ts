/**
 * Binders API Routes
 * 
 * Handles CRUD operations for user binders.
 * 
 * GET: Retrieve all user's binders
 * POST: Create a new binder
 * 
 * @route /api/binders
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

// Get user's binders
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

        // Get game filter from query params
        const searchParams = request.nextUrl.searchParams;
        const game = searchParams.get("game") || "all";

        // Get all binders for the user with their cards
        const binders = await prisma.binder.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { binderCards: true },
                },
                binderCards: {
                    select: {
                        cardId: true,
                    },
                },
            },
        });

        return NextResponse.json({ binders, gameFilter: game });
    } catch (error) {
        console.error("Error fetching binders:", error);
        return NextResponse.json(
            { error: "Failed to fetch binders" },
            { status: 500 }
        );
    }
}

// Create a new binder
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
        const { name, description, color, game, size } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid request. name is required and must be a non-empty string." },
                { status: 400 }
            );
        }

        // Validate optional fields
        if (description !== undefined && typeof description !== "string" && description !== null) {
            return NextResponse.json(
                { error: "Invalid request. description must be a string or null." },
                { status: 400 }
            );
        }
        if (color !== undefined && typeof color !== "string" && color !== null) {
            return NextResponse.json(
                { error: "Invalid request. color must be a string or null." },
                { status: 400 }
            );
        }
        if (game !== undefined && game !== null && typeof game !== "string") {
            return NextResponse.json(
                { error: "Invalid request. game must be a string or null." },
                { status: 400 }
            );
        }
        // Validate game value if provided
        if (game !== undefined && game !== null && !["mtg", "pokemon", "yugioh"].includes(game)) {
            return NextResponse.json(
                { error: "Invalid request. game must be one of: mtg, pokemon, yugioh, or null (for favorites/all games)." },
                { status: 400 }
            );
        }
        if (size !== undefined && size !== null && typeof size !== "string") {
            return NextResponse.json(
                { error: "Invalid request. size must be a string or null." },
                { status: 400 }
            );
        }
        // Validate size value if provided
        if (size !== undefined && size !== null && !["2x2", "3x3", "4x4"].includes(size)) {
            return NextResponse.json(
                { error: "Invalid request. size must be one of: 2x2, 3x3, 4x4, or null." },
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

        // Create binder
        const binder = await prisma.binder.create({
            data: {
                userId: dbUser.id,
                name: name.trim(),
                description: description?.trim() || null,
                color: color || null,
                game: game || null, // null means "all" (favorites)
                size: size || null,
            },
            include: {
                _count: {
                    select: { binderCards: true },
                },
            },
        });

        return NextResponse.json({ binder });
    } catch (error) {
        console.error("Error creating binder:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

