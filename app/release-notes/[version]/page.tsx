/**
 * Individual release note page
 *
 * @page
 * @route /release-notes/[version]
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRelease, releases } from "../registry";

type PageProps = {
    params: Promise<{ version: string }>;
};

export function generateStaticParams() {
    return releases.map((r) => ({ version: r.slug }));
}

export default async function ReleaseNotePage({ params }: PageProps) {
    const { version } = await params;
    const release = getRelease(version);

    if (!release) notFound();

    return (
        <main
            className="
                min-h-[calc(100vh-8rem)]
                bg-[var(--theme-bg)]
                px-4 sm:px-6 py-6
                text-[var(--theme-fg)]
            "
        >
            <article className="max-w-3xl">
                <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:underline transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <span className="opacity-40">/</span>
                    <Link
                        href="/release-notes"
                        className="opacity-70 hover:opacity-100 hover:underline transition"
                    >
                        Release Notes
                    </Link>
                </div>

                <header className="mb-8 border-b border-[var(--theme-border)] pb-6">
                    <p className="text-xs uppercase tracking-wide opacity-60">{release.date}</p>
                    <h1 className="text-2xl sm:text-3xl font-semibold mt-2">{release.title}</h1>
                    <p className="text-sm sm:text-base opacity-80 mt-3 leading-relaxed">
                        {release.summary}
                    </p>
                </header>

                <div className="space-y-8">
                    {release.sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>
                            <ul className="space-y-2.5 list-disc pl-5 text-sm opacity-90 leading-relaxed">
                                {section.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-[var(--theme-border)]">
                    <Link
                        href="/release-notes"
                        className="text-sm opacity-80 hover:opacity-100 hover:underline"
                    >
                        ← All release notes
                    </Link>
                </div>
            </article>
        </main>
    );
}
