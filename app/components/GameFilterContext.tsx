"use client";

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";

export type GameKey = "all" | "mtg" | "pokemon" | "yugioh";

type GameFilterContextValue = {
    game: GameKey;
    setGame: (game: GameKey) => void;
};

const GameFilterContext = createContext<GameFilterContextValue | null>(null);

const STORAGE_KEY = "deckhaven_game_filter";

function getStoredGame(): GameKey {
    if (typeof window === "undefined") return "all";
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "mtg" || stored === "pokemon" || stored === "yugioh") {
            return stored;
        }
    } catch (e) {
        // localStorage might not be available
    }
    return "all";
}

function setStoredGame(game: GameKey) {
    if (typeof window === "undefined") return;
    try {
        if (game === "all") {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, game);
        }
    } catch (e) {
        // localStorage might not be available
    }
}

export function GameFilterProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [gameState, setGameState] = useState<GameKey>("all");

    useEffect(() => {
        setMounted(true);
        // Initialize from localStorage
        setGameState(getStoredGame());
    }, []);

    const game: GameKey = mounted ? gameState : "all";

    const setGame = (next: GameKey) => {
        // Update localStorage
        setStoredGame(next);
        // Update state (this triggers re-render without navigation)
        setGameState(next);
    };

    const value = useMemo(() => ({ game, setGame }), [game]);

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