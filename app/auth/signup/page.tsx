/**
 * Sign Up Page
 *
 * Registration page for new users to create a DeckHaven account.
 * Uses Stack-Auth for authentication handling.
 *
 * @page
 * @route /auth/signup
 */

"use client";

import { SignUp } from "@stackframe/stack";

export default function SignUpPage() {
    return (
        <main
            className="
        min-h-screen
        flex items-center justify-center
        bg-[var(--theme-bg)]
        px-6 py-6
        text-[var(--theme-fg)]
      "
        >
            <div className="w-full max-w-md">
                <SignUp automaticRedirect />
            </div>
        </main>
    );
}