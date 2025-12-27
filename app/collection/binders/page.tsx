"use client";

export default function BindersPage() {
    return (
        <main
            className="
        min-h-[calc(100vh-8rem)]
        bg-[#f6ead6] dark:bg-[#0f2a2c]
        px-6 py-6
        text-[#193f44] dark:text-[#e8d5b8]
        transition-all duration-300
      "
        >
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Binders</h2>
                    <p className="text-sm opacity-70 mt-1">Create and manage your favorite binder layouts.</p>
                </div>
            </section>
        </main>
    );
}