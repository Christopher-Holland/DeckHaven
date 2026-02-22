"use client";

import { Suspense } from "react";
import { SignIn } from "@stackframe/stack";
import Loading from "@/app/components/Loading";

export default function SignInPage() {
    return (
        <main className="
      min-h-screen flex items-center justify-center
      bg-[var(--theme-bg)]
      px-6 py-6
      text-[var(--theme-fg)]
    ">
            <div className="w-full max-w-md">
                <Suspense fallback={<Loading fullPage={false} />}>
                    <SignIn automaticRedirect />
                </Suspense>
            </div>
        </main>
    );
}