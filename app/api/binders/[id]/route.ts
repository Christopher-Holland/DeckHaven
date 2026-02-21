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
import { updateBinderSchema } from "@/app/lib/schemas/binder";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

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

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = updateBinderSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { name, description, color, spineColor, pageColor, game, size } = parseResult.data;

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
                name,
                description,
                color,
                spineColor,
                pageColor,
                game,
                size,
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

