import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sidebar from "../app/components/Sidebar"; 
import { SidebarProvider } from "../app/components/SidebarContext"; 

function renderSidebar() {
    return render(
        <SidebarProvider>
            <Sidebar />
        </SidebarProvider>
    );
}

describe("Sidebar", () => {
    it("renders navigation items", () => {
        renderSidebar();

        // Since we mocked usePathname() to /dashboard, it should render normally
        expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /sets/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /collection/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /decks/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /wishlist/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /faq/i })).toBeInTheDocument();
    });

    it("collapses when the toggle is clicked", async () => {
        const user = userEvent.setup();
        const { container } = renderSidebar();

        // Expanded state shows brand name
        expect(screen.getByText("DeckHaven")).toBeInTheDocument();

        // Click toggle
        const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
        await user.click(toggle);

        // Collapsed state hides brand name
        expect(screen.queryByText("DeckHaven")).not.toBeInTheDocument();

        // Optional: assert width class change (your aside has w-64 vs w-16)
        const aside = container.querySelector("aside");
        expect(aside).toBeTruthy();
        expect(aside?.className).toMatch(/\bw-16\b/);
    });
});