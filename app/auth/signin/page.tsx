"use client";

import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
    return (
        <main className="
      min-h-screen flex items-center justify-center
      bg-[var(--theme-bg)]
      px-6 py-6
      text-[var(--theme-fg)]
    ">
            <div className="w-full max-w-md">
                <SignIn automaticRedirect />
            </div>
        </main>
    );
}