/**
 * Validation helpers for API route boundary parsing.
 * Returns structured error response for failed validation.
 */

import { NextResponse } from "next/server";
import type { z } from "zod";

/** Format validation failure as a 400 response. Does not throw. */
export function validationErrorResponse(error: z.ZodError) {
    const issues = error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
    }));
    const firstMessage = issues[0]?.message ?? "Validation failed";
    return NextResponse.json(
        {
            error: `Invalid request. ${firstMessage}`,
            details: issues,
        },
        { status: 400 }
    );
}
