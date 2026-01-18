/**
 * Binder API Routes (Individual Binder)
 * 
 * Handles operations for a specific binder.
 * 
 * PATCH: Update a binder
 * DELETE: Delete a binder
 * 
 * @route /api/binders/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

// Get a single binder with its cards
export async function GET(
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

        // Get binder with its cards
        const binder = await prisma.binder.findFirst({
            where: {
                id: binderId,
                userId: dbUser.id,
            },
            include: {
                _count: {
                    select: { binderCards: true },
                },
                binderCards: {
                    select: {
                        id: true,
                        cardId: true,
                        slotNumber: true,
                    },
                    orderBy: [
                        { slotNumber: "asc" },
                    ],
                },
            },
        });

        if (!binder) {
            return NextResponse.json(
                { error: "Binder not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ binder });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch binder" },
            { status: 500 }
        );
    }
}

// Update a binder
export async function PATCH(
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
        const { name, description, color, spineColor, pageColor, game, size } = body;

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
        if (spineColor !== undefined && typeof spineColor !== "string" && spineColor !== null) {
            return NextResponse.json(
                { error: "Invalid request. spineColor must be a string or null." },
                { status: 400 }
            );
        }
        if (pageColor !== undefined && typeof pageColor !== "string" && pageColor !== null) {
            return NextResponse.json(
                { error: "Invalid request. pageColor must be a string or null." },
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
        const existingBinder = await prisma.binder.findFirst({
            where: {
                id: binderId,
                userId: dbUser.id,
            },
        });

        if (!existingBinder) {
            return NextResponse.json(
                { error: "Binder not found" },
                { status: 404 }
            );
        }

        // Update binder
        const binder = await prisma.binder.update({
            where: { id: binderId },
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                color: color || null,
                spineColor: spineColor || null,
                pageColor: pageColor || null,
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
        const errorMessage = error instanceof Error ? error.message : "Failed to update binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

// Delete a binder
export async function DELETE(
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
        const existingBinder = await prisma.binder.findFirst({
            where: {
                id: binderId,
                userId: dbUser.id,
            },
        });

        if (!existingBinder) {
            return NextResponse.json(
                { error: "Binder not found" },
                { status: 404 }
            );
        }

        // Delete binder (cascade will handle binderCards)
        await prisma.binder.delete({
            where: { id: binderId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

