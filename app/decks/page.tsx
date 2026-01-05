"use client";

export default function DecksPage() {
    return (
        <main className="
            min-h-[calc(100vh-8rem)]
            bg-[#f6ead6] dark:bg-[#0f2a2c]
            px-6 py-6
            text-[#193f44] dark:text-[#e8d5b8]
            transition-all duration-300
        ">
            {/* Page Header */}
            <section className="mb-6 flex items-center justify-between gap-4">
                {/* Left: title + subtitle */}
                <div>
                    <h2 className="text-2xl font-semibold">Decks</h2>
                    <p className="text-sm opacity-80 mt-1">
                        Your decks and deck building tools
                    </p>
                </div>

                {/* Right: action button */}
                <button
                    className="
                        px-3 py-1.5 rounded-md text-sm font-medium
                        bg-black/5 dark:bg-white/5
                        border border-[#42c99c] dark:border-[#82664e]
                        hover:bg-black/10 dark:hover:bg-white/10
                        transition-colors
                        focus:outline-none focus:ring-2 focus:ring-[#42c99c]
                        dark:focus:ring-[#82664e]
                        "
                >
                    Create Deck
                </button>
            </section>

            {/* Content Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Deck Box Card (flip-top w/ lip + latch) */}
                <div
                    className="
                        group relative
                        rounded-2xl
                        border border-[#42c99c] dark:border-[#82664e]
                        bg-[#e8d5b8] dark:bg-[#173c3f]
                        shadow-xl
                        overflow-hidden
                        aspect-[3/4]
                    "
                    style={{ perspective: "1200px" }}
                >
                    {/* subtle texture */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.10]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)",
                        }}
                    />

                    {/* LID (top ~25%) */}
                    <div
                        className="
                            absolute inset-x-0 top-0 h-[26%]
                            origin-bottom
                            transition-transform duration-300 ease-out
                            group-hover:-translate-y-1 group-hover:rotateX-14
                            z-30
                            "
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="relative h-full">
                            {/* Lid face */}
                            <div
                                className="
                                    relative h-full
                                    border-b border-black/10 dark:border-white/10
                                    bg-white/40 dark:bg-black/20
                                    "
                            >
                                {/* lid shine */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 opacity-60"
                                    style={{
                                        background:
                                            "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.10), rgba(0,0,0,0.10))",
                                    }}
                                />

                                {/* hinge seam (double line) */}
                                <div className="absolute inset-x-0 bottom-0 h-[3px]">
                                    <div className="absolute inset-x-0 top-0 h-px bg-black/15 dark:bg-white/15" />
                                    <div className="absolute inset-x-0 bottom-0 h-px bg-black/10 dark:bg-white/10" />
                                </div>

                                {/* FRONT LIP */}
                                <div
                                    className="
                                        absolute inset-x-0 bottom-[-10px]
                                        mx-auto w-[88%] h-[18px]
                                        rounded-b-xl
                                        border border-black/10 dark:border-white/10
                                        bg-white/45 dark:bg-black/20
                                        shadow-md
                                    "
                                >
                                    {/* lip highlight */}
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 opacity-60 rounded-b-xl"
                                        style={{
                                            background:
                                                "linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0), rgba(0,0,0,0.12))",
                                        }}
                                    />

                                    {/* LATCH NOTCH (center cut) */}
                                    <div
                                        className="
                                            absolute left-1/2 -translate-x-1/2 top-[3px]
                                            w-8 h-3
                                            rounded-b-md
                                            bg-black/15 dark:bg-white/15
                                            border border-black/15 dark:border-white/15
                                            "
                                    />
                                    {/* tiny inner shadow to feel “cut in” */}
                                    <div
                                        aria-hidden="true"
                                        className="
                                            absolute left-1/2 -translate-x-1/2 top-[4px]
                                            w-7 h-2 rounded-b-md
                                            bg-black/10 dark:bg-black/10
                                            "
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="absolute inset-0 pt-[26%] z-10">
                        <div
                            className="
                                relative h-full
                                bg-white/55 dark:bg-black/20
                                border-t border-black/10 dark:border-white/10
                            "
                        >
                            {/* inner wall / depth */}
                            <div className="absolute inset-x-3 top-4 bottom-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/35 dark:bg-black/15 shadow-inner" />

                            {/* label plate */}
                            <div className="absolute inset-x-0 bottom-6 px-5">
                                <div
                                    className="
                                        rounded-xl
                                        border border-black/15 dark:border-white/15
                                        bg-white/85 dark:bg-black/30
                                        px-4 py-3
                                        shadow-md
                                        backdrop-blur
                                        "
                                >
                                    <p className="text-xs uppercase tracking-wider opacity-70">
                                        DeckHaven Deck
                                    </p>
                                    <p className="text-lg font-semibold truncate">Untitled Deck</p>
                                    <p className="text-xs opacity-70 mt-1">100 cards • MTG • Commander</p>
                                </div>
                            </div>

                            {/* base shadow / weight */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-8 bottom-4 h-10 blur-2xl opacity-25"
                                style={{
                                    background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)",
                                }}
                            />
                        </div>
                    </div>

                    {/* subtle lift on hover */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none absolute inset-0
                            transition-transform duration-300 ease-out
                            group-hover:-translate-y-[2px]
                            "
                    />
                </div>
            </section>
        </main>
    );
}