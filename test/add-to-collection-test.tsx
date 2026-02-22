import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddToCollectionControl from "../app/components/AddToCollectionControl";

describe("AddToCollectionControl", () => {
    it("shows Add to collection button when quantity is 0", () => {
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={0} onChange={onChange} />);

        expect(screen.getByRole("button", { name: /add to collection/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/decrease quantity/i)).not.toBeInTheDocument();
    });

    it("calls onChange(1) when Add to collection is clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={0} onChange={onChange} />);

        await user.click(screen.getByRole("button", { name: /add to collection/i }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("shows increment/decrement controls when quantity > 0", () => {
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={3} onChange={onChange} />);

        expect(screen.queryByRole("button", { name: /add to collection/i })).not.toBeInTheDocument();
        expect(screen.getByLabelText("Decrease quantity")).toBeInTheDocument();
        expect(screen.getByLabelText("Increase quantity")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("calls onChange when decrease is clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={2} onChange={onChange} />);

        await user.click(screen.getByLabelText("Decrease quantity"));

        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("calls onChange when increase is clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={2} onChange={onChange} />);

        await user.click(screen.getByLabelText("Increase quantity"));

        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("disables decrease button when at min", () => {
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={1} onChange={onChange} min={1} />);

        expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
    });

    it("disables increase button when at max", () => {
        const onChange = vi.fn();
        render(<AddToCollectionControl quantity={10} onChange={onChange} max={10} />);

        expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
    });
});
