import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/lib/logger";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password, code } = body;

        if (!password || !code) {
            return NextResponse.json(
                { error: "Both password and code are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.STACK_PROJECT_ID || "";
        const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "";

        if (!projectId || !publishableKey) {
            throw new Error("Stack Auth configuration missing");
        }

        // Call Stack Auth API to reset password with code
        // This is a client endpoint, so we use publishable key
        const response = await fetch("https://api.stack-auth.com/api/v1/auth/password/reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Stack-Project-Id": projectId,
                "X-Stack-Publishable-Client-Key": publishableKey,
                "X-Stack-Access-Type": "client",
            },
            body: JSON.stringify({
                password,
                code,
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
            logger.error("Stack Auth password reset error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
            });
            throw new Error(errorData.message || errorData.error || `Failed to reset password: ${response.statusText}`);
        }

        const result = await response.json();

        return NextResponse.json({ success: result.success });
    } catch (error) {
        logger.error("Error resetting password:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to reset password" },
            { status: 500 }
        );
    }
}
