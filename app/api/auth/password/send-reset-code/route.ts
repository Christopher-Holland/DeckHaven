import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";
import { sendResetCodeSchema } from "@/app/lib/schemas/auth";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

export async function POST(request: NextRequest) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body", details: [{ message: "Request body must be valid JSON" }] },
                { status: 400 }
            );
        }

        const parseResult = sendResetCodeSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { email } = parseResult.data;

        const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.STACK_PROJECT_ID || "";
        const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "";

        if (!projectId || !publishableKey) {
            throw new Error("Stack Auth configuration missing");
        }

        // Client-initiated operation; uses publishable key (not secret).
        const response = await fetch("https://api.stack-auth.com/api/v1/auth/password/send-reset-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Stack-Project-Id": projectId,
                "X-Stack-Publishable-Client-Key": publishableKey,
                "X-Stack-Access-Type": "client",
            },
            body: JSON.stringify({
                email,
                callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/settings?tab=security&reset=true`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || response.statusText };
            }
            logger.error("Stack Auth send reset code error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
            });
            throw new Error(errorData.message || errorData.error || `Failed to send reset code: ${response.statusText}`);
        }

        const result = await response.json();

        return NextResponse.json({ success: result.success });
    } catch (error) {
        logger.error("Error sending reset code:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send reset code" },
            { status: 500 }
        );
    }
}
