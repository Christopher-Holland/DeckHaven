"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type GameKey = "all" | "mtg" | "pokemon" | "yugioh";

type GameFilterContextValue = {
    game: GameKey;
    setGame: (game: GameKey) => void;
};

const GameFilterContext = createContext<GameFilterContextValue | null>(null);

export function GameFilterProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const gameParam = (searchParams.get("game") || "all") as GameKey;
    const game: GameKey =
        gameParam === "mtg" || gameParam === "pokemon" || gameParam === "yugioh"
            ? gameParam
            : "all";

    const setGame = (next: GameKey) => {
        const params = new URLSearchParams(searchParams.toString());

        if (next === "all") params.delete("game");
        else params.set("game", next);

        // Optional: reset pagination/sorting when switching games
        params.delete("page");

        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    };

    const value = useMemo(() => ({ game, setGame }), [game, searchParams]);

    return (
        <GameFilterContext.Provider value={value}>
            {children}
        </GameFilterContext.Provider>
    );
}

export function useGameFilter() {
    const ctx = useContext(GameFilterContext);
    if (!ctx) throw new Error("useGameFilter must be used within GameFilterProvider");
    return ctx;
}