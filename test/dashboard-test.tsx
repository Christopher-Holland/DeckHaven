import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import DashboardPage from "../app/dashboard/page";

const createResolvingMock = () =>
    vi.fn((url: string) => {
            if (url.includes("/api/collection")) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            pagination: { totalQuantity: 42 },
                            items: [],
                        }),
                });
            }
            if (url.includes("/api/decks")) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            decks: [
                                { id: "1", name: "Test Deck", totalCards: 60 },
                            ],
                        }),
                });
            }
            if (url.includes("/api/binders")) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            binders: [
                                { id: "1", name: "Test Binder", _count: { binderCards: 20 } },
                            ],
                        }),
                });
            }
            if (url.includes("/api/wishlist")) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            wishlist: [{ id: "1", cardId: "abc" }],
                        }),
                });
            }
            return Promise.resolve({ ok: false });
        });

describe("Dashboard page", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows loading state on mount", () => {
        // Mock fetch to never resolve so loading state persists
        vi.stubGlobal("fetch", () => new Promise(() => {}));
        render(<DashboardPage />);
        expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it("renders dashboard content after data loads", async () => {
        vi.stubGlobal("fetch", createResolvingMock());
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText("Dashboard")).toBeInTheDocument();
        });

        // Header and refresh button
        expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();

        // Stat cards with mocked data (42 = Total Cards, 1 = Decks/Binders/Wishlist)
        expect(screen.getByText("42")).toBeInTheDocument();
        expect(screen.getAllByText("1")).toHaveLength(3);

        // Action cards
        expect(screen.getByRole("button", { name: /browse sets/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /collection/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /binders/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /decks/i })).toBeInTheDocument();

        // My Decks section shows mocked deck
        expect(screen.getByText("Test Deck")).toBeInTheDocument();

        // My Binders section shows mocked binder
        expect(screen.getByText("Test Binder")).toBeInTheDocument();
    });
});
