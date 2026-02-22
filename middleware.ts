/**
 * Next.js Middleware
 * 
 * Handles authentication and user synchronization for protected routes.
 * Syncs Stack-Auth user with database on each request to protected routes.
 * 
 * @middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "./app/lib/stack";
import { prisma } from "./app/lib/prisma";
import { logger } from "./app/lib/logger";

const protectedRoutes = [
    "/dashboard",
    "/sets",
    "/collection",
    "/decks",
    "/wishlist",
    "/settings",
];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected) {
        try {
            const user = await stackServerApp.getUser();

            if (!user) {
                const signInUrl = new URL("/auth/signin", request.url);
                signInUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(signInUrl);
            }

            await prisma.user.upsert({
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
        } catch (error) {
            logger.error("Middleware error:", error);
            // Continue to page even if sync fails to prevent auth loops. User sync errors are logged but don't block access.
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

