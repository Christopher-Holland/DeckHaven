import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.STACK_PROJECT_ID || "";
        const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "";

        if (!projectId || !publishableKey) {
            throw new Error("Stack Auth configuration missing");
        }

        // Call Stack Auth API to send reset code
        // This is a client endpoint, so we use publishable key
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
            console.error("Stack Auth send reset code error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
            });
            throw new Error(errorData.message || errorData.error || `Failed to send reset code: ${response.statusText}`);
        }

        const result = await response.json();

        return NextResponse.json({ success: result.success });
    } catch (error) {
        console.error("Error sending reset code:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send reset code" },
            { status: 500 }
        );
    }
}
