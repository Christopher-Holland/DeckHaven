/**
 * User Sync API Route
 * 
 * Syncs Stack-Auth user with local database. Creates a User record if it doesn't exist,
 * or updates existing user information. Called after successful authentication.
 * 
 * @route /api/auth/sync
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Sync user with database
        const dbUser = await prisma.user.upsert({
            where: { stackUserId: user.id },
            update: {
                email: user.primaryEmail,
                name: user.displayName || user.primaryEmail?.split("@")[0] || null,
                image: user.profileImageUrl || null,
            },
            create: {
                stackUserId: user.id,
                email: user.primaryEmail,
                name: user.displayName || user.primaryEmail?.split("@")[0] || null,
                image: user.profileImageUrl || null,
            },
        });

        return NextResponse.json({ user: dbUser });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to sync user" },
            { status: 500 }
        );
    }
}

