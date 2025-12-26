/**
 * Sign In Page
 * 
 * Authentication page for users to sign in to their DeckHaven account.
 * Uses Stack-Auth for authentication handling.
 * 
 * @page
 * @route /auth/signin
 */

"use client";

import { SignIn } from "@stackframe/stack";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";

    return (
        <main
            className="
                min-h-screen
                flex items-center justify-center
                bg-[#f6ead6] dark:bg-[#0f2a2c]
                px-6 py-6
                text-[#193f44] dark:text-[#e8d5b8]
            "
        >
            <div className="w-full max-w-md">
                <SignIn afterSignInRedirect={redirect} />
            </div>
        </main>
    );
}

