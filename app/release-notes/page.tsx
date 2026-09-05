/**
 * Release Notes index
 *
 * Lists every published DeckHaven update. Individual notes live in
 * version files (v1.0.tsx, …) and are registered in registry.ts.
 *
 * @page
 * @route /release-notes
 */

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { releases } from "./registry";

export default function ReleaseNotesPage() {
    return (
        <main
            className="
                min-h-[calc(100vh-8rem)]
                bg-[var(--theme-bg)]
                px-4 sm:px-6 py-6
                text-[var(--theme-fg)]
            "
        >
            <section className="mb-8 max-w-3xl">
                <Link
                    href="/dashboard"
                    className="
                        inline-flex items-center gap-2
                        text-sm opacity-70
                        hover:opacity-100 hover:underline
                        transition
                        mb-4
                    "
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <h1 className="text-2xl sm:text-3xl font-semibold">Release Notes</h1>
                <p className="text-sm opacity-70 mt-2">
                    What&apos;s new in DeckHaven — features, improvements, and fixes by version.
                </p>
            </section>

            <section className="max-w-3xl space-y-4">
                {releases.map((release) => (
                    <Link
                        key={release.slug}
                        href={`/release-notes/${release.slug}`}
                        className="
                            block rounded-lg
                            border border-[var(--theme-border)]
                            bg-[var(--theme-sidebar)]
                            p-4 sm:p-5
                            hover:border-[var(--theme-accent)]/60
                            transition-colors
                        "
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wide opacity-60">
                                    {release.date}
                                </p>
                                <h2 className="text-lg font-semibold mt-1">{release.title}</h2>
                                <p className="text-sm opacity-80 mt-1.5 leading-relaxed">
                                    {release.summary}
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 shrink-0 mt-1 opacity-60" />
                        </div>
                    </Link>
                ))}
            </section>
        </main>
    );
}
