/**
 * Zod schemas for user-related API payloads.
 */

import { z } from "zod";
import type { BaseThemeId, AccentColorId } from "@/app/lib/themes";
import { baseThemes, accentColors } from "@/app/lib/themes";

const themeIds = Object.keys(baseThemes) as [BaseThemeId, ...BaseThemeId[]];
const accentIds = Object.keys(accentColors) as [AccentColorId, ...AccentColorId[]];

/** Schema for updating user settings (theme, accent) */
export const userSettingsSchema = z
    .object({
        theme: z.enum(themeIds).optional(),
        accent: z.enum(accentIds).optional(),
    })
    .strict();

/** Inferred TypeScript type from the user-settings schema */
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

/** Schema for updating user profile (display_name, primary_email) */
export const userUpdateSchema = z
    .object({
        display_name: z.string().min(1, "display_name must be a non-empty string").optional(),
        primary_email: z.string().email("primary_email must be a valid email").optional(),
    })
    .strict();

/** Inferred TypeScript type from the user-update schema */
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
