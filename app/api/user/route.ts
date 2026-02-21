import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/lib/stack";
import { logger } from "@/app/lib/logger";
import { userUpdateSchema } from "@/app/lib/schemas/user";
import { validationErrorResponse } from "@/app/lib/schemas/parse";

export async function PATCH(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
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

        const parseResult = userUpdateSchema.safeParse(body);
        if (!parseResult.success) {
            return validationErrorResponse(parseResult.error);
        }

        const { display_name, primary_email } = parseResult.data;
        const updateData: { display_name?: string; primary_email?: string } = {};
        if (display_name !== undefined) updateData.display_name = display_name;
        if (primary_email !== undefined) updateData.primary_email = primary_email;

        // Call Stack Auth REST API directly using server credentials
        const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.STACK_PROJECT_ID || "";
        const secretKey = process.env.STACK_SECRET_SERVER_KEY || "";
        
        if (!projectId || !secretKey) {
            throw new Error("Stack Auth configuration missing");
        }

        const response = await fetch(`https://api.stack-auth.com/api/v1/users/${user.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Stack-Project-Id": projectId,
                "X-Stack-Secret-Server-Key": secretKey,
                "X-Stack-Access-Type": "server",
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText || response.statusText };
            }
            logger.error("Stack Auth API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
            });
            throw new Error(errorData.message || errorData.error || `Failed to update user: ${response.statusText}`);
        }

        const updatedUser = await response.json();

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        logger.error("Error updating user:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Call Stack Auth REST API directly using server credentials
        const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.STACK_PROJECT_ID || "";
        const secretKey = process.env.STACK_SECRET_SERVER_KEY || "";
        
        if (!projectId || !secretKey) {
            throw new Error("Stack Auth configuration missing");
        }

        const response = await fetch(`https://api.stack-auth.com/api/v1/users/${user.id}`, {
            method: "DELETE",
            headers: {
                "X-Stack-Project-Id": projectId,
                "X-Stack-Secret-Server-Key": secretKey,
                "X-Stack-Access-Type": "server",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Error deleting user:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete user" },
            { status: 500 }
        );
    }
}
