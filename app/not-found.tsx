import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-fg)] px-6">
            <h1 className="text-4xl font-semibold mb-2">404</h1>
            <p className="text-lg opacity-80 mb-6">Page not found</p>
            <Link
                href="/"
                className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-accent)] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
                Return Home
            </Link>
        </main>
    );
}
