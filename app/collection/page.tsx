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
      "
        >
            {/* Header */}
            <section className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Collection</h2>
                    <p className="text-sm opacity-70 mt-1">
                        Inventory-first view of everything you own.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="
              px-3 py-1.5 rounded-md text-sm font-medium
              bg-black/5 dark:bg-white/5
              border border-[#42c99c] dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
            "
                    >
                        Add Item
                    </button>
                    <button
                        className="
              px-3 py-1.5 rounded-md text-sm font-medium
              bg-black/5 dark:bg-white/5
              border border-[#42c99c] dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
            "
                    >
                        Import
                    </button>
                </div>
            </section>

            {/* Stat tiles */}
            <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total Cards", value: "100" },
                    { label: "MTG", value: "60" },
                    { label: "Pokémon", value: "30" },
                    { label: "Yu-Gi-Oh!", value: "10" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="
              rounded-lg p-4
              border border-[#42c99c] dark:border-[#82664e]
              bg-[#e8d5b8] dark:bg-[#173c3f]
            "
                    >
                        <p className="text-xs opacity-70">{s.label}</p>
                        <p className="text-xl font-semibold mt-1">{s.value}</p>
                    </div>
                ))}
            </section>

            {/* Controls bar */}
            <section
                className="
          mb-4 rounded-lg p-3
          border border-[#42c99c] dark:border-[#82664e]
          bg-black/5 dark:bg-white/5
          flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between
        "
            >
                <input
                    placeholder="Search your collection…"
                    className="
            w-full lg:max-w-sm
            rounded-md px-3 py-2 text-sm
            bg-[#e8d5b8] dark:bg-[#173c3f]
            border border-[#42c99c] dark:border-[#82664e]
            focus:outline-none focus:ring-2 focus:ring-[#42c99c]
            dark:focus:ring-[#82664e]
          "
                />

                <div className="flex flex-wrap items-center gap-2">
                    {["All", "MTG", "Pokémon", "Yu-Gi-Oh!"].map((t) => (
                        <button
                            key={t}
                            className="
                px-3 py-1.5 rounded-md text-sm
                bg-[#e8d5b8] dark:bg-[#173c3f]
                border border-[#42c99c] dark:border-[#82664e]
                hover:bg-black/10 dark:hover:bg-white/10
                transition-colors
              "
                        >
                            {t}
                        </button>
                    ))}

                    <button
                        className="
              px-3 py-1.5 rounded-md text-sm font-medium
              bg-[#e8d5b8] dark:bg-[#173c3f]
              border border-[#42c99c] dark:border-[#82664e]
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
            "
                    >
                        Filters
                    </button>
                </div>
            </section>

            {/* Inventory list */}
            <section
                className="
          rounded-lg overflow-hidden
          border border-[#42c99c] dark:border-[#82664e]
          bg-[#e8d5b8] dark:bg-[#173c3f]
        "
            >
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold opacity-80 border-b border-black/10 dark:border-white/10">
                    <div className="col-span-5">Card</div>
                    <div className="col-span-2">Set</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2">Tags</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Example row */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-black/10 dark:bg-white/10" />
                        <div>
                            <p className="font-medium leading-tight">Example Card Name</p>
                            <p className="text-xs opacity-70">MTG</p>
                        </div>
                    </div>
                    <div className="col-span-2 text-xs opacity-80">Example Set</div>
                    <div className="col-span-1 text-center font-semibold">2</div>
                    <div className="col-span-2 text-xs opacity-80">Binder • Deck</div>
                    <div className="col-span-2 flex justify-end gap-2">
                        <button className="text-xs underline opacity-80 hover:opacity-100">Edit</button>
                        <button className="text-xs underline opacity-80 hover:opacity-100">+1</button>
                    </div>
                </div>
            </section>
        </main>
    );
}