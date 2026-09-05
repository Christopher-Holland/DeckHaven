/**
 * Home / Landing Page
 * 
 * The landing page displayed when users first visit the application.
 * Features the DeckHaven logo, tagline, login/register buttons, and
 * feature highlights. Uses a minimal layout without sidebar/navbar.
 * 
 * @page
 */

"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import Image from "next/image";
import { Button } from "./components/Button";

function HomeContent() {
    const user = useUser();
    const router = useRouter();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);
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
            <div
                className="
          w-full max-w-xl
          text-center
          flex flex-col items-center
          mt-0 sm:-mt-8 lg:-mt-16
        "
            >
                {/* Logo */}
                <div className="mb-6">
                    <Image
                        src="/images/DeckHaven-Shield.png"
                        alt="Deck Haven logo"
                        width={256}
                        height={256}
                        className="rounded-full shadow-[0_0_30px_rgba(130,102,78,0.25)] dark:shadow-[0_0_30px_rgba(66,201,156,0.35)]"
                        priority
                    />
                </div>

                {/* App Title */}
                <h1 className="text-3xl sm:text-4xl font-semibold mb-3">
                    Deck Haven
                </h1>

                {/* Tagline */}
                <p className="text-base sm:text-lg opacity-80 mb-8">
                    The collector's safe haven.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button
                        href="/auth/signin"
                        variant="secondary"
                        size="md"
                        className="shadow-sm hover:bg-[var(--theme-accent)] hover:text-white"
                    >
                        Log In
                    </Button>

                    <Button
                        href="/auth/signup"
                        variant="primary"
                        size="md"
                        className="shadow-sm hover:bg-[var(--theme-accent-hover)] hover:opacity-100"
                    >
                        Create Account
                    </Button>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-px bg-[var(--theme-accent)]/60" />
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2 text-sm opacity-80">
                    <p>Track and organize your card collection</p>
                    <p>Build and manage decks across sets</p>
                    <p>Stay updated with the latest TCG news</p>
                </div>
            </div>
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <main
                className="
                    min-h-screen
                    flex items-center justify-center
                    bg-[var(--theme-bg)]
                    px-6 py-6
                    text-[var(--theme-fg)]
                "
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-accent)] mx-auto mb-4"></div>
                    <p className="text-sm opacity-70">Loading...</p>
                </div>
            </main>
        }>
            <HomeContent />
        </Suspense>
    );
}
