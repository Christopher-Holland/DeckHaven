"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
      <div
        className="
          w-full max-w-xl
          text-center
          flex flex-col items-center
          -mt-64
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
        <h1 className="text-4xl font-semibold mb-3">
          Deck Haven
        </h1>

        {/* Tagline */}
        <p className="text-lg opacity-80 mb-8">
          The collector's safe haven.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/login"
            className="
              rounded-lg
              border border-[#42c99c] dark:border-[#82664e]
              bg-[#e8d5b8] dark:bg-[#173c3f]
              text-[#193f44] dark:text-[#e8d5b8]
              px-6 py-3
              text-sm font-semibold
              hover:bg-[#42c99c] hover:text-white
              dark:hover:bg-[#82664e] dark:hover:text-[#e8d5b8]
              transition-all duration-200
              shadow-sm
            "
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="
              rounded-lg
              border border-[#42c99c] dark:border-[#82664e]
              bg-[#42c99c] dark:bg-[#82664e]
              text-white dark:text-[#e8d5b8]
              px-6 py-3
              text-sm font-semibold
              hover:bg-[#36c293] dark:hover:bg-[#9d7a5f]
              transition-all duration-200
              shadow-sm
            "
          >
            Create Account
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-px bg-[#82664e]/60" />
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