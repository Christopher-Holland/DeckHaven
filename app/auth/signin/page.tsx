"use client";

import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
    return (
        <main className="
      min-h-screen flex items-center justify-center
      bg-[#f6ead6] dark:bg-[#0f2a2c]
      px-6 py-6
      text-[#193f44] dark:text-[#e8d5b8]
    ">
            <div className="w-full max-w-md">
                <SignIn automaticRedirect />
            </div>
        </main>
    );
}