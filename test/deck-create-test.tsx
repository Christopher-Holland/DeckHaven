import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DrawerProvider, useDrawer } from "../app/components/Drawer/drawerProvider";
import { DrawerHost } from "../app/components/Drawer/DrawerHost";
import { ToastProvider } from "../app/components/ToastContext";

function CreateDeckTrigger() {
    const { open } = useDrawer();
    return (
        <button type="button" onClick={() => open("CREATE_DECK", {})}>
            Open Create Deck
        </button>
    );
}

function renderCreateDeckFlow() {
    return render(
        <ToastProvider>
            <DrawerProvider>
                <CreateDeckTrigger />
                <DrawerHost />
            </DrawerProvider>
        </ToastProvider>
    );
}

describe("Deck create flow", () => {
    it("opens create deck drawer and shows form", async () => {
        const user = userEvent.setup();
        renderCreateDeckFlow();

        await user.click(screen.getByRole("button", { name: /open create deck/i }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter deck name/i)).toBeInTheDocument();
        });

        expect(screen.getByPlaceholderText(/enter deck description/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue("Standard")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^create deck$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("disables Create Deck button when name is empty", async () => {
        const user = userEvent.setup();
        renderCreateDeckFlow();

        await user.click(screen.getByRole("button", { name: /open create deck/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /^create deck$/i })).toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /^create deck$/i })).toBeDisabled();
    });

    it("closes drawer when name is entered and Create Deck is clicked", async () => {
        const user = userEvent.setup();
        renderCreateDeckFlow();

        await user.click(screen.getByRole("button", { name: /open create deck/i }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter deck name/i)).toBeInTheDocument();
        });

        await user.type(screen.getByPlaceholderText(/enter deck name/i), "My Test Deck");
        const createBtn = screen.getByRole("button", { name: /^create deck$/i });
        await waitFor(() => {
            expect(createBtn).not.toBeDisabled();
        });

        await user.click(createBtn);

        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/enter deck name/i)).not.toBeInTheDocument();
        });
    });

    it("closes drawer when Cancel is clicked", async () => {
        const user = userEvent.setup();
        renderCreateDeckFlow();

        await user.click(screen.getByRole("button", { name: /open create deck/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        await waitFor(() => {
            expect(screen.queryByPlaceholderText(/enter deck name/i)).not.toBeInTheDocument();
        });
    });
});
