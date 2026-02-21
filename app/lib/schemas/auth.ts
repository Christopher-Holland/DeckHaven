/**
 * Zod schemas for auth-related API payloads.
 */

import { z } from "zod";

/** Schema for sending password reset code */
export const sendResetCodeSchema = z
    .object({
        email: z.string().email("Email is required and must be a valid email"),
    })
    .strict();

/** Inferred TypeScript type from the send-reset-code schema */
export type SendResetCodeInput = z.infer<typeof sendResetCodeSchema>;

/** Schema for resetting password with code */
export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters long"),
        code: z.string().min(1, "Code is required"),
    })
    .strict();

/** Inferred TypeScript type from the reset-password schema */
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
