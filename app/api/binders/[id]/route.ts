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

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

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

        const dbUser = await prisma.user.findUnique({
            where: { stackUserId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found. Please sync your account." },
                { status: 404 }
            );
        }

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

