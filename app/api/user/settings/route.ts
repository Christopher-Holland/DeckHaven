/**
 * User Settings API
 *
 * GET: Return theme, accent, and other preferences for the current user.
 * PATCH: Update theme and/or accent (persisted to UserSettings).
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { prisma } from "@/app/lib/prisma";
import { defaultBaseTheme, defaultAccentColor } from "@/app/lib/themes";
import type { BaseThemeId, AccentColorId } from "@/app/lib/themes";
import { baseThemes, accentColors } from "@/app/lib/themes";
import { userSettingsSchema } from "@/app/lib/schemas/user";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

async function getDbUser() {
    const user = await stackServerApp.getUser();
    if (!user) return null;
    const dbUser = await prisma.user.findUnique({
        where: { stackUserId: user.id },
        include: { userSettings: true },
    });
    return dbUser;
}

/** GET - fetch user settings (theme, accent). Creates with defaults if missing. */
export async function GET() {
    try {
        const dbUser = await getDbUser();
        if (!dbUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let settings = dbUser.userSettings;
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: dbUser.id,
                    theme: defaultBaseTheme,
                    accent: defaultAccentColor,
                },
            });
        }

        const theme = (settings.theme in baseThemes ? settings.theme : defaultBaseTheme) as BaseThemeId;
        const accent = (settings.accent in accentColors ? settings.accent : defaultAccentColor) as AccentColorId;

        return NextResponse.json({
            theme,
            accent,
            reducedMotion: settings.reducedMotion,
            defaultDeckFormat: settings.defaultDeckFormat,
            showOwnedBadges: settings.showOwnedBadges,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

/** PATCH - update theme and/or accent. Validates against theme IDs. */
export async function PATCH(request: NextRequest) {
    try {
        const dbUser = await getDbUser();
        if (!dbUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        const parseResult = userSettingsSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { theme, accent } = parseResult.data;
        const updateData: { theme?: string; accent?: string } = {};
        if (theme !== undefined) updateData.theme = theme;
        if (accent !== undefined) updateData.accent = accent;

        if (Object.keys(updateData).length === 0) {
            const existing = await prisma.userSettings.findUnique({
                where: { userId: dbUser.id },
            });
            return NextResponse.json({
                theme: (existing?.theme ?? defaultBaseTheme) as BaseThemeId,
                accent: (existing?.accent ?? defaultAccentColor) as AccentColorId,
            });
        }

        const settings = await prisma.userSettings.upsert({
            where: { userId: dbUser.id },
            update: updateData,
            create: {
                userId: dbUser.id,
                theme: (updateData.theme as BaseThemeId) || defaultBaseTheme,
                accent: (updateData.accent as AccentColorId) || defaultAccentColor,
            },
        });

        return NextResponse.json({
            theme: settings.theme as BaseThemeId,
            accent: settings.accent as AccentColorId,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
