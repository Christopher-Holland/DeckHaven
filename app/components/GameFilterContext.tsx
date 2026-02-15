"use client";

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type GameKey = "all" | "mtg" | "pokemon" | "yugioh";

type GameFilterContextValue = {
    game: GameKey;
    setGame: (game: GameKey) => void;
};

const GameFilterContext = createContext<GameFilterContextValue | null>(null);

const STORAGE_KEY = "deckhaven_game_filter";

// Map sets page game IDs to game filter keys
const urlToGameKeyMap: Record<string, GameKey> = {
    mtg: "mtg",
    ptcg: "pokemon",
    ytcg: "yugioh",
};

// Map game filter keys to sets page game IDs
const gameKeyToUrlMap: Record<GameKey, string> = {
    all: "all",
    mtg: "mtg",
    pokemon: "ptcg",
    yugioh: "ytcg",
};

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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [gameState, setGameState] = useState<GameKey>("all");

    useEffect(() => {
        setMounted(true);
        // Initialize from URL param first (on sets pages), then localStorage
        if (pathname.startsWith("/sets")) {
            const urlGameParam = searchParams.get("game");
            if (urlGameParam) {
                const gameKey = urlToGameKeyMap[urlGameParam];
                if (gameKey) {
                    setGameState(gameKey);
                    setStoredGame(gameKey);
                    return;
                }
            }
        }
        // Otherwise, use stored game
        const stored = getStoredGame();
        setGameState(stored);
    }, []);

    // When navigating to /sets with a game filter already selected, redirect to browse
    // so the user sees sets for their selected game without having to re-select
    useEffect(() => {
        if (!mounted) return;
        if (pathname === "/sets" && gameState !== "all") {
            const gameId = gameKeyToUrlMap[gameState];
            router.replace(`/sets/browse?game=${gameId}`, { scroll: false });
        }
    }, [pathname, gameState, mounted, router]);

    // Sync URL param to state when it changes (from browser navigation)
    useEffect(() => {
        if (!mounted) return;
        
        // On sets pages, sync from URL param
        if (pathname.startsWith("/sets")) {
            const urlGameParam = searchParams.get("game");
            if (urlGameParam) {
                const gameKey = urlToGameKeyMap[urlGameParam];
                if (gameKey && gameState !== gameKey) {
                    setGameState(gameKey);
                    setStoredGame(gameKey);
                }
            }
        }
    }, [searchParams, pathname, mounted, gameState]);

    const game: GameKey = mounted ? gameState : "all";

    const setGame = (next: GameKey) => {
        // Update localStorage
        setStoredGame(next);
        // Update state
        setGameState(next);

        // Update URL for sets pages
        if (pathname.startsWith("/sets")) {
            const params = new URLSearchParams(searchParams.toString());
            if (next === "all") {
                // If setting to "all", navigate to /sets (without game param)
                if (pathname === "/sets/browse") {
                    router.replace("/sets", { scroll: false });
                } else {
                    params.delete("game");
                    params.delete("page");
                    const qs = params.toString();
                    const newUrl = qs ? `${pathname}?${qs}` : pathname;
                    router.replace(newUrl, { scroll: false });
                }
            } else {
                // Map game key to sets page game ID
                const gameId = gameKeyToUrlMap[next];
                params.set("game", gameId);
                params.delete("page"); // Reset pagination when switching games

                // If on /sets, navigate to /sets/browse with game param
                if (pathname === "/sets") {
                    router.replace(`/sets/browse?game=${gameId}`, { scroll: false });
                } else {
                    // Otherwise, update URL with game param
                    const qs = params.toString();
                    router.replace(`/sets/browse?game=${gameId}`, { scroll: false });
                }
            }
        }
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