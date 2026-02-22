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
import { createBinderSchema } from "@/app/lib/schemas/binder";
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

        const searchParams = request.nextUrl.searchParams;
        const game = searchParams.get("game") || "all";

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
        return NextResponse.json(
            { error: "Failed to fetch binders" },
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

        const parseResult = createBinderSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { name, description, color, spineColor, pageColor, game, size } = parseResult.data;

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

        const binder = await prisma.binder.create({
            data: {
                userId: dbUser.id,
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
        const errorMessage = error instanceof Error ? error.message : "Failed to create binder";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

