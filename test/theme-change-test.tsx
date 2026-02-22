import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SettingsPage from "../app/settings/page";
import { DeckHavenThemeProvider } from "../app/components/ThemeContext";
import { ToastProvider } from "../app/components/ToastContext";

vi.mock("@stackframe/stack", () => ({
    useUser: () => null,
}));

function renderSettingsWithTheme() {
    return render(
        <ToastProvider>
            <DeckHavenThemeProvider>
                <SettingsPage />
            </DeckHavenThemeProvider>
        </ToastProvider>
    );
}

describe("Theme change flow", () => {
    beforeEach(() => {
        // Reset localStorage for consistent tests
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem("deckhaven-base-theme");
            localStorage.removeItem("deckhaven-accent-color");
        }
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("renders Settings page with Appearance tab", () => {
        renderSettingsWithTheme();

        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /appearance/i }).length).toBeGreaterThan(0);
    });

    it("shows theme options when Appearance tab is selected", async () => {
        const user = userEvent.setup();
        renderSettingsWithTheme();

        const appearanceTab = screen.getAllByRole("button", { name: /appearance/i })[0];
        await user.click(appearanceTab);

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Appearance", level: 3 })).toBeInTheDocument();
        });

        // Theme presets from baseThemes
        expect(screen.getByText("DeckHaven - Light")).toBeInTheDocument();
        expect(screen.getByText("DeckHaven - Dark")).toBeInTheDocument();

        // Accent colors
        expect(screen.getByText("Emerald")).toBeInTheDocument();
        expect(screen.getByText("Bronze")).toBeInTheDocument();
    });

    it("changes theme when a theme preset is clicked", async () => {
        const user = userEvent.setup();
        renderSettingsWithTheme();

        const appearanceTab = screen.getAllByRole("button", { name: /appearance/i })[0];
        await user.click(appearanceTab);

        await waitFor(() => {
            expect(screen.getByText("DeckHaven - Light")).toBeInTheDocument();
        });

        await user.click(screen.getByText("DeckHaven - Light"));

        await waitFor(() => {
            expect(document.documentElement.getAttribute("data-base-theme")).toBe("deckhaven-light");
        });
    });

    it("changes accent color when an accent option is clicked", async () => {
        const user = userEvent.setup();
        renderSettingsWithTheme();

        const appearanceTab = screen.getAllByRole("button", { name: /appearance/i })[0];
        await user.click(appearanceTab);

        await waitFor(() => {
            expect(screen.getByText("Gold")).toBeInTheDocument();
        });

        await user.click(screen.getByText("Gold"));

        await waitFor(() => {
            expect(document.documentElement.getAttribute("data-accent-color")).toBe("gold");
        });
    });
});
