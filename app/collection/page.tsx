"use client";

export default function CollectionPage() {
    return (
        <main
            className="
                min-h-[calc(100vh-8rem)]
                bg-[#f6ead6] dark:bg-[#0f2a2c]
                px-6 py-6
                text-[#193f44] dark:text-[#e8d5b8]
                transition-all duration-300
            ">
            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b border-[#42c99c] dark:border-[#82664e] pb-2">Collection</h2>
            </section>
            <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    Statistics
                </div>
            </section>
        </main>
    );
}