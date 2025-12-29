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
        const { name, description, color } = body;

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
            },
            include: {
                _count: {
                    select: { binderCards: true },
                },
            },
        });

        return NextResponse.json({ binder });
    } catch (error) {
        console.error("Error updating binder:", error);
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
        console.error("Error deleting binder:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

