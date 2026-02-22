import React from "react";
import { vi } from "vitest";

// -----------------------------
// next/navigation mock
// -----------------------------
let pathname = "/dashboard";

export const __setPathname = (nextPath: string) => {
    pathname = nextPath;
};

vi.mock("next/navigation", () => ({
    usePathname: () => pathname,

    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
    }),

    // Safe defaults for future hooks
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// -----------------------------
// next/link mock
// -----------------------------
vi.mock("next/link", async () => {
    const React = (await import("react")).default;

    return {
        __esModule: true,
        default: ({ href, children, ...props }: any) =>
            React.createElement("a", { href, ...props }, children),
    };
});